import { config } from "./config"

/**
 * 🐢 Static actions
 */

const getTokenInfoById = (type:number) =>
{
    for(let i in config.address.tokensInfo)
    {
        if(type == config.address.tokensInfo[i as keyof typeof config.address.tokensInfo ].id)
        {
            return config.address.tokensInfo[i as keyof typeof config.address.tokensInfo ];
        }
    }
    return config.address.tokensInfo.wmon;
}


/**
 * 🚀 ERC20 Token actions
 */


const getTokenTotalSupply = async (token:string,publicClient:any) =>
    {
        return await publicClient.readContract({
            address: token,
            abi: config.abi.token,
            functionName: 'totalSupply',
          })
    }

const getTokenAllowance = async (token:string,me:string,who:string,publicClient:any) =>
    {
        return await publicClient.readContract({
            address: token,
            abi: config.abi.token,
            functionName: 'allowance',
            args: [me,who]
          })
    }

const getTokenBlance = async (token:string,who:string,publicClient:any) =>
    {
        return await publicClient.readContract({
            address: token,
            abi: config.abi.token,
            functionName: 'balanceOf',
            args: [who]
          })
    }

const getTokenDecimal = async (token:string,publicClient:any) =>
    {
        return await publicClient.readContract({
            address: token,
            abi: config.abi.token,
            functionName: 'decimals',
          })
    }


const tokenApprove = async (token:string,to:string,who:string,amount:string="0",sendTx:any) =>
    {
        try {
            const ret = await sendTx({
              address: token,
              abi: config.abi.token,
              functionName: 'approve',
              args: [
                to, 
                amount
              ],
              account:who,
            })
            return ret;
          } catch (error) {
            return false;
          }
    }

/**
 * 🚀 Uniswap v2 actions 
 */

const getTokenAmountsOut = async (tokenIn:string,tokenOut:string,amount:string="0",publicClient:any) =>
    {
        return await publicClient.readContract({
            address: config.address.uniswap_router,
            abi: config.abi.uniswapV2,
            functionName: 'getAmountsOut',
            args: [
                amount,
                [tokenIn,tokenOut]
            ]
          })
    }


/**
 * 🚀 Vault actions
 */

const deposite = async (type:number=0,amount:string="0",me:string,publicClient:any,sendTx:any) =>
{
    try {
        console.log("Now try staking")
        let ret ;
        if(type == 0)
        {
            //ETH
            // ret = await sendTx({
            //     address: config.address.vault,
            //     abi: config.abi.vault,
            //     functionName: 'depositETH',
            //     value:amount
            //   })
              ret = await sendTx({
                address: config.address.vault,
                abi: config.abi.vault,
                functionName: 'depositETH',
                value: amount,
                account: me,
              })
              console.log(ret)
        }else{
            let token = config.address.tokens.usdt;
            if(type ==2 )
            {
                token = config.address.tokens.usdc;
            }
            //Check allowance
            if(amount > await getTokenAllowance(token,me,config.address.vault,publicClient))
            {
                await tokenApprove(
                    token,
                    config.address.vault,
                    me,
                    amount,
                    sendTx,
                )
            }
            //Send tx
            ret = await sendTx({
                address: config.address.vault,
                abi: config.abi.vault,
                functionName: 'deposit',
                args: [
                  token, 
                  amount
                ],
                account: me,
              })
        }
        return ret;
      } catch (error) {
        return false;
      }
}


const redeem = async (type:number=0,amount:string="0",me:string,publicClient:any,sendTx:any) =>
    {
        try {
            console.log("Now try withdraw")
            let ret ;
            console.log(1)
                let token = config.address.lp.lpeth;
                if(type ==1 )
                {
                    token = config.address.lp.lpusdt;
                }
                if(type ==2 )
                {
                    token = config.address.lp.lpusdc;
                }
                //Check allowance
                console.log(2,token)
                const allowances =  await getTokenAllowance(token,me,config.address.vault,publicClient)
                console.log(token,allowances)
                if(amount >allowances)
                {
                    await tokenApprove(
                        token,
                        config.address.vault,
                        me,
                        amount,
                        sendTx
                    )
                }
                //Send tx
                ret = await sendTx({
                    address: config.address.vault,
                    abi: config.abi.vault,
                    functionName: 'redeem',
                    args: [
                       type, 
                      amount
                    ],
                    account: me,
                  })
            return ret;
          } catch (error) {
            return false;
          }
    }

/**
 * 🚀 Leverage contract actions
 */

const getPositionDetails = async (toPair : string,id:number,publicClient:any) =>
{
    const details = await publicClient.readContract({
        address: toPair,
        abi: config.abi.pair,
        functionName: 'positions',
        args: [id]
    })
    return {
        type:details[0],
        owner : details[1],
        mortgageAmount : details[2],
        investAmount : details[3],
        tokenAmount : details[4],
        isOpen : details[5],
        openTime : details[6]
    }
}
const getUserPositions = async (who:string,publicClient:any) =>
    {
        const ret :any[] = [];
        for( let i in [0])//config.address.pairs)
        {

            // const toPair =  config.address.pairs[i as keyof typeof config.address.pairs];
            const toPair =  config.address.router
            const r = await publicClient.readContract({
                address: toPair,
                abi: config.abi.pair,
                functionName: 'getUserPositions',
                args: [who]
            })
            // let toTokenInfo = config.address.tokensInfo[i as keyof typeof config.address.tokensInfo];
            for(i in r)
            {
                const details = await getPositionDetails(toPair,r[i],publicClient)
                if(!details.isOpen)
                {
                    continue;
                }
                // const fromTokenInfo = getTokenInfoById(Number(details.type))
                const final =  {
                    id:r[i],
                    router:toPair,
                    // token:toTokenInfo.symbol,
                    // tokenDecimal:Number(toTokenInfo.decimal),
                    // baseToken:fromTokenInfo.symbol,
                    // baseTokenDecimal:fromTokenInfo.decimal,
                    mortgageAmount:Number(details.mortgageAmount),
                    investAmount:Number(details.investAmount),
                    tokenAmount:Number(details.tokenAmount),
                    leverageRate:Number(details.investAmount/details.mortgageAmount).toFixed(1),
                    openTime:Number(details.openTime),
                  }
                ret.push(
                    final
                )
            }
            
        }
        return ret;
    }


const open = async (type:number=0,toToken:string,mortgage:string="0",amount:string="0",me:string,publicClient:any,sendTx:any) =>
    {
        try {
            // const toPair =  config.address.pairs[toToken as keyof typeof config.address.pairs];
            const toPair = config.address.router;
            console.log("Now try open")
            let ret ;
            if(type == 0)
            {
                //ETH
                ret = await sendTx({
                    address: toPair,
                    abi: config.abi.pair,
                    functionName: 'buy',
                    args: [
                        type, 
                        mortgage,
                        amount
                      ],
                    value:mortgage,
                    account:me,
                  })
            }else{
                let token = config.address.tokens.usdt;
                if(type ==2 )
                {
                    token = config.address.tokens.usdc;
                }
                //Check allowance
                if(amount > await getTokenAllowance(token,me,config.address.vault,publicClient))
                {
                    await tokenApprove(
                        token,
                        config.address.vault,
                        me,
                        amount,
                        sendTx
                    )
                }
                //Send tx
                ret = await sendTx({
                    address: toPair,
                    abi: config.abi.pair,
                    functionName: 'buy',
                    args: [
                        type, 
                        mortgage,
                        amount
                    ],
                  })
            }
            return ret;
          } catch (error) {
            console.error(error)
            return false;
          }
    }


    const close = async (positionId:number=0,to:string,sendTx:any) =>
        {
            try {
                console.log("Now try close")
                const ret = await sendTx({
                    address: to,
                    abi: config.abi.pair,
                    functionName: 'close',
                    args: [
                        positionId
                    ],
                  })
                return ret;
              } catch (error) {
                console.error(error)
                return false;
              }
        }
export {
    config,

    //ERC20 Tokens
    tokenApprove,
    getTokenAllowance,
    getTokenBlance,
    getTokenDecimal,
    getTokenTotalSupply,

    //Vault
    redeem,
    deposite,

    //Uniswap v2
    getTokenAmountsOut,

    //Leverage
    open,
    close,
    getUserPositions,
    getPositionDetails,
    getTokenInfoById
}
# 🧪 QQB Frontend (on Monad)

Welcome to the official **frontend repository** of **QQB Protocol** — a next-gen onchain leveraged trading engine running on the 🟣 **Monad blockchain**.

This frontend interfaces directly with QQB’s smart contracts and backend services to provide a high-performance, permissionless trading experience.

---

## 🧭 Overview

**QQB Frontend** is the user interface layer of the protocol, enabling:

- 🧮 Opening/closing leveraged positions
- 📈 Real-time position tracking
- 💰 Collateral & fee management
- ⚠️ Liquidation risk visualization
- 📊 Market data visualization (Uniswap V2 integration)
- 🧾 Transaction history & metrics

---

## 🧩 Tech Stack

| Layer        | Technology                        |
|-------------|------------------------------------|
| Framework    | [Next.js](https://nextjs.org/)     |
| UI Library   | [Tailwind CSS](https://tailwindcss.com) + shadcn/ui |
| Wallets      | [Wagmi](https://wagmi.sh/) + [RainbowKit](https://www.rainbowkit.com/) |
| Blockchain   | [viem](https://viem.sh/) + [Monad EVM] |
| Contracts    | Interfaced via auto-generated ABIs |
| State Mgmt   | Zustand / React Hooks              |
| Charts       | Recharts / Lightweight custom SVG  |
| RPC Layer    | Connects to Monad RPC nodes        |

---

## 📂 Project Structure


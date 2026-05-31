# Ready Set Ride

A live scooter rental web app built with React and Vite, deployed on GitHub Pages.

**Live Demo:** [tekeyahbennett-coder.github.io/ready-set-ride](https://tekeyahbennett-coder.github.io/ready-set-ride)

---

## Features

- **Interactive Map** — Browse available scooters by location with real-time battery level indicators
- **QR Code Scanner** — Scan scooter QR codes to unlock and start a ride instantly
- **Digital Wallet** — Add and manage payment methods (Visa, Mastercard, Amex, Discover); fund balance before riding
- **Live Ride Timer** — Per-minute billing with a real-time fare tracker during active rides
- **Ride History** — Full log of past rides with cost, duration, scooter ID, and date
- **Receipt Screen** — Itemized receipt generated after each completed ride
- **User Authentication** — Sign-up / login flow with form validation and session persistence
- **Profile Management** — View account info, saved payment methods, and wallet balance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Inline CSS-in-JS |
| Fonts | Google Fonts (Syne, DM Sans) |
| Deployment | GitHub Pages |
| Language | JavaScript (JSX) |

---

## Project Structure

```
ready-set-ride/
├── src/
│   ├── App.jsx        # Full application — all screens and logic
│   └── main.jsx       # React entry point
├── public/            # Static assets
├── index.html         # HTML shell
├── vite.config.js     # Vite + GitHub Pages base path config
└── package.json
```

---

## Screens

| Screen | Description |
|---|---|
| Auth | Sign-up and login with input validation |
| Map View | Interactive scooter map with battery levels and locations |
| QR Scanner | Camera-based QR code unlock flow |
| Confirm | Pre-ride fare estimate and confirmation |
| Ride | Active ride timer with live cost tracking |
| Receipt | Post-ride itemized cost summary |
| History | Full ride history log |
| Payment | Add / manage wallet and saved payment methods |
| Profile | Account details and settings |

---

## How to Run Locally

```bash
git clone https://github.com/tekeyahbennett-coder/ready-set-ride.git
cd ready-set-ride
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Author

**Te'Keyah Bennett** — [GitHub](https://github.com/tekeyahbennett-coder) | [Portfolio](https://tekeyahbennett-coder.github.io)

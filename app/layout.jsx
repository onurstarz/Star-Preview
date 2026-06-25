export const metadata = {
  title: "Star Desk — School Dashboard",
  description: "A cozy quick-launch dashboard for Ontario Virtual School and your everyday school tools.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>{children}</body>
    </html>
  );
}

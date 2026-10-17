// Draws a Spotify-Wrapped-style card on a canvas and returns it as a PNG file.
// No server needed: the phone's share sheet sends the image straight to WhatsApp/Instagram.
export async function makeShareCard(name: string, score: number, total: number, grid: string): Promise<File> {
  const S = 1080;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "#FF5A36"); g.addColorStop(0.55, "#FF9A3C"); g.addColorStop(1, "#FFD36E");
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);

  const pct = total ? score / total : 0;
  const title = pct >= 0.8 ? "Sugar Detective" : pct >= 0.5 ? "Getting There" : "Sugar Rookie";

  ctx.fillStyle = "#1B1B1F";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.fillText("Guess the Sugar · today", 70, 110);
  ctx.font = "400 46px system-ui, sans-serif";
  ctx.fillText(`${name || "Someone"} is a`, 70, 430);
  ctx.font = "900 108px system-ui, sans-serif";
  ctx.fillText(title, 70, 550);
  ctx.font = "800 60px system-ui, sans-serif";
  ctx.fillText(`${score}/${total} spikes spotted`, 70, 650);
  ctx.font = "54px system-ui, sans-serif";
  ctx.fillText(grid, 70, 750);
  ctx.font = "500 32px system-ui, sans-serif";
  ctx.fillText("Can you beat it?", 70, 1010);
  ctx.font = "900 36px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("steer", S - 70, 1010);

  const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
  return new File([blob], "guess-the-sugar.png", { type: "image/png" });
}

const PALETTE = [
  { fill: "#FFE08A", border: "#E2B93D", header: "#F6C94C" },
  { fill: "#9AD7F5", border: "#3BA4D6", header: "#5BB8E4" },
  { fill: "#B8F0C8", border: "#3CAF6A", header: "#6FDB93" },
  { fill: "#F7B4D2", border: "#D95C98", header: "#F08ABA" },
  { fill: "#D2C4F7", border: "#8B6FE0", header: "#A991F0" },
  { fill: "#FFC4A8", border: "#E07A45", header: "#F39A6B" },
  { fill: "#A8F0E8", border: "#2EAEA0", header: "#5DD1C4" },
  { fill: "#F9D6A5", border: "#D89A3C", header: "#F0B85A" },
] as const;

export function colorForPath(path: string) {
  let hash = 0;
  for (let i = 0; i < path.length; i += 1) {
    hash = (hash * 31 + path.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

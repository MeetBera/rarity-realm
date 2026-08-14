with open("src/pages/Index.tsx", "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

res = lines[:18] + lines[24:63] + ['import { Nav } from "@/components/Nav";'] + lines[197:]

with open("src/pages/Index.tsx", "w", encoding="utf-8") as f:
    f.write("\n".join(res) + "\n")

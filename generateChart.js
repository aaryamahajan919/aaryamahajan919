const fs = require("fs");

async function main() {
  const username = "aaryamahajan919";

  const res = await fetch(`https://api.github.com/users/${username}/repos`, {
    headers: {
      Authorization: `token ${process.env.GH_TOKEN}`
    }
  });

  const repos = await res.json();

  const langBytes = {};

  for (const repo of repos) {
    if (!repo.languages_url) continue;

    const langRes = await fetch(repo.languages_url, {
      headers: {
        Authorization: `token ${process.env.GH_TOKEN}`
      }
    });

    const data = await langRes.json();

    for (const lang in data) {
      langBytes[lang] = (langBytes[lang] || 0) + data[lang];
    }
  }

  const labels = Object.keys(langBytes);
  const values = Object.values(langBytes);

  // 🌸 Lavender palettes
  const darkColors = [
    "#cba6f7","#a084e8","#d6ccff","#f5c2e7","#b4befe","#cdd6f4"
  ];

  const lightColors = [
    "#6b4de6","#8b6cf0","#b9a7ff","#e0d4ff","#cdb4ff","#a084e8"
  ];

  function createChart(colors, textColor, bg) {
    return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: textColor }
          }
        }
      }
    }))}&backgroundColor=${bg}`;
  }

  const darkChart = createChart(darkColors, "#cdd6f4", "#0d1117");
  const lightChart = createChart(lightColors, "#4b4453", "#faf4ff");

  const content = `
## 💜 Language Donut Chart

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${darkChart}">
    <source media="(prefers-color-scheme: light)" srcset="${lightChart}">
    <img src="${darkChart}" width="400">
  </picture>
</p>
`;

  // Replace only section between markers
  let readme = fs.readFileSync("README.md", "utf-8");

  const start = "<!--START_LANG_CHART-->";
  const end = "<!--END_LANG_CHART-->";

  const updated =
    readme.split(start)[0] +
    start +
    content +
    end +
    readme.split(end)[1];

  fs.writeFileSync("README.md", updated);
}

main();

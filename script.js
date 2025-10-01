document.getElementById('download-report').addEventListener('click', () => {
  const builds = loadSaved();

  if (builds.length === 0) {
    alert('Nenhuma montagem salva para exportar.');
    return;
  }

  const header = [
    "Carimbo de data/hora",
    "Colaborador",
    "Placa Mãe",
    "Processador",
    "Memoria Ram",
    "HD",
    "Processador",
    "Memoria Ram",
    "HD",
    "Processador",
    "Memoria Ram",
    "HD",
    "Processador",
    "Memoria Ram",
    "HD",
    "Processador",
    "Memoria Ram",
    "HD"
  ];

  // Agrupar por ID (colaborador)
  const grouped = {};

  builds.forEach(b => {
    if (!grouped[b.id]) grouped[b.id] = [];
    grouped[b.id].push(b);
  });

  const rows = [];

  for (const id in grouped) {
    const registros = grouped[id];
    const first = registros[0];
    const timestamp = new Date(first.timestamp).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo"
    });

    const row = [
      `"${timestamp}"`,
      `"${id}"`,
      `"${first.socket || ""}"`
    ];

    // Até 5 builds por colaborador (como colunas)
    for (let i = 0; i < 5; i++) {
      const build = registros[i];
      if (build) {
        row.push(
          `"${build.cpu || ""}"`,
          `"${build.memConfig || ""}"`,
          `"${build.hd || ""}"`
        );
      } else {
        row.push("", "", "");
      }
    }

    rows.push(row);
  }

  // Gera o CSV final
  const csvContent = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "montagens.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

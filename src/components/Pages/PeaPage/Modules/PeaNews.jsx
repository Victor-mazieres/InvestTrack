const news = [
    { title: "Tesla annonce des résultats record", date: "15 Février 2024" },
    { title: "Apple lance un nouveau produit révolutionnaire", date: "12 Février 2024" },
    { title: "Amazon et l'intelligence artificielle : une avancée majeure", date: "10 Février 2024" },
  ];
  
  export default function PeaNews() {
    return (
      <div className="w-full p-4 shadow-md">
        <h2 className="text-lg font-semibold text-primary">Dernières Actualités</h2>
        <ul>
          {news.map((article, index) => (
            <li key={index} className="py-2 border-b">
              <p className="text-secondary font-medium">{article.title}</p>
              <p className="text-grayBlue text-sm">{article.date}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
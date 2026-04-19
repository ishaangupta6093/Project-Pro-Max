function searchRestaurant() {
  const query = document.getElementById("searchInput").value.toLowerCase();

  db.collection("restaurants").get().then(snapshot => {
    let html = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.name.toLowerCase().includes(query)) {
        html += `
          <div>
            <h3>${data.name}</h3>
            <a href="restaurant.html?id=${doc.id}">View</a>
          </div>
        `;
      }
    });

    document.getElementById("results").innerHTML = html;
  });
}
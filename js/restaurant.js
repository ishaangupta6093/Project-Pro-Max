const id = getQueryParam("id");

let restaurantData = {};

function loadRestaurant() {
  db.collection("restaurants").doc(id).get().then(doc => {
    const data = doc.data();
    restaurantData = data;

    document.getElementById("name").innerText = data.name;

    loadVotes();
    loadPhoto();
  });
}

function loadVotes() {
  db.collection("votes").where("restaurantId", "==", id)
    .get().then(snapshot => {

      let positive = 0;
      let negative = 0;

      snapshot.forEach(doc => {
        if (doc.data().vote) positive++;
        else negative++;
      });

      const score = calculateScore({
        complaints: restaurantData.complaints || 0,
        positiveVotes: positive,
        negativeVotes: negative
      });

      document.getElementById("score").innerText =
        score + " - " + getScoreLabel(score);

      document.getElementById("votes").innerText =
        `👍 ${positive} | 👎 ${negative}`;
    });
}

function loadPhoto() {
  db.collection("photos")
    .where("restaurantId", "==", id)
    .orderBy("timestamp", "desc")
    .limit(1)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        document.getElementById("photo").src = doc.data().imageUrl;
      });
    });
}

function vote(isClean) {
  db.collection("votes").add({
    restaurantId: id,
    vote: isClean
  }).then(() => {
    loadVotes();
  });
}

loadRestaurant();
function uploadImage() {
  const file = document.getElementById("image").files[0];

  const ref = storage.ref("photos/" + file.name);

  ref.put(file).then(snapshot => {
    snapshot.ref.getDownloadURL().then(url => {

      db.collection("photos").add({
        restaurantId: "demo-id", // replace dynamically if needed
        imageUrl: url,
        timestamp: new Date()
      });

      alert("Uploaded!");
    });
  });
}
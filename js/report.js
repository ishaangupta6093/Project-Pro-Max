const id = getQueryParam("id");

function submitReport() {
  const issue = document.getElementById("issue").value;

  db.collection("reports").add({
    restaurantId: id,
    issue: issue,
    timestamp: new Date()
  }).then(() => {
    alert("Reported!");
  });
}
let model;

async function loadModel() {
  model = await tf.loadLayersModel("/model/model.json");
  console.log("Model loaded");
}

loadModel();

async function predict() {
  const file = document.getElementById("imageUpload").files[0];

  if (!file) {
    alert("Upload an image first!");
    return;
  }

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);

  img.onload = async () => {
    const tensor = tf.browser.fromPixels(img)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255)
      .expandDims();

    const prediction = await model.predict(tensor);
    const data = await prediction.data();

    const classes = ["Biodegradable", "Recyclable", "Hazardous"];
    const maxIndex = data.indexOf(Math.max(...data));
    const category = classes[maxIndex];

    document.getElementById("prediction").innerText =
      "Detected: " + category;

    sendToBackend(category);
  };
}

async function sendToBackend(category) {
  const response = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ category })
  });

  const data = await response.json();
  document.getElementById("aiResult").innerText = data.result;
}
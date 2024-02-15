const axios = require("axios").default;

var data = JSON.stringify({
  valor: 100000,
  tipo: "d",
  descricao: "descricao",
});

var config = {
  method: "post",
  url: "http://localhost:9999/clientes/1/transacoes",
  headers: {
    "Content-Type": "application/json",
  },
  data: data,
  validateStatus() {
    return true;
  },
};

async function run() {
  const promises = [];

  for (let x = 0; x < 100; x++) {
    promises.push(axios(config));
  }

  const responses = await Promise.all(promises);

  const result = responses.reduce(
    (previous, response) => ({
      ...previous,
      [response.status]:
        typeof previous[response.status] === "number"
          ? (previous[response.status] += 1)
          : 1,
      [`status_${response.status}`]: [
        ...(previous[`status_${response.status}`] || []),
        response.data,
      ],
    }),
    {}
  );

  console.log(result);
}

run()
  .catch(console.error)
  .then(() => console.log("Done"));

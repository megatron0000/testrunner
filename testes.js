it("se a=10, b=20 => deve retornar 30", () => {
  const expected = 30;
  const result = soma(10, 20);
  expect(result).to.deep.equal(expected);
});

it("se a=10, b=30 => deve retornar 40", () => {
  console.log("segundo teste");
  const expected = 40;
  const result = soma(10, 30);
  expect(result).to.deep.equal(expected);
});

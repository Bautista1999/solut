import "../../../chunks/index.js";
function load({ params }) {
  console.log(params.id);
  return {
    id: params.id
  };
}
export {
  load
};

import { c as create_ssr_component, b as compute_rest_props, e as escape, d as spread, f as escape_attribute_value, g as escape_object, h as compute_slots, v as validate_component, i as add_attribute } from "../../../chunks/ssr.js";
import { H as Header } from "../../../chunks/header.js";
import "@junobuild/core";
import "../../../chunks/ProgressBar.svelte_svelte_type_style_lang.js";
import "openai";
import { nanoid } from "nanoid";
const cBase = "textarea relative flex justify-center items-center";
const cInput = "w-full absolute top-0 left-0 right-0 bottom-0 z-[1] opacity-0 disabled:!opacity-0 cursor-pointer";
const cInterface = "flex justify-center items-center text-center";
const FileDropzone = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classesBase;
  let classesInput;
  let classesInterface;
  let $$restProps = compute_rest_props($$props, [
    "files",
    "name",
    "border",
    "padding",
    "rounded",
    "regionInterface",
    "regionInterfaceText",
    "slotLead",
    "slotMessage",
    "slotMeta"
  ]);
  let $$slots = compute_slots(slots);
  let { files = void 0 } = $$props;
  let { name } = $$props;
  let { border = "border-2 border-dashed" } = $$props;
  let { padding = "p-4 py-8" } = $$props;
  let { rounded = "rounded-container-token" } = $$props;
  let { regionInterface = "" } = $$props;
  let { regionInterfaceText = "" } = $$props;
  let { slotLead = "mb-4" } = $$props;
  let { slotMessage = "" } = $$props;
  let { slotMeta = "opacity-75" } = $$props;
  function prunedRestProps() {
    delete $$restProps.class;
    return $$restProps;
  }
  if ($$props.files === void 0 && $$bindings.files && files !== void 0)
    $$bindings.files(files);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.border === void 0 && $$bindings.border && border !== void 0)
    $$bindings.border(border);
  if ($$props.padding === void 0 && $$bindings.padding && padding !== void 0)
    $$bindings.padding(padding);
  if ($$props.rounded === void 0 && $$bindings.rounded && rounded !== void 0)
    $$bindings.rounded(rounded);
  if ($$props.regionInterface === void 0 && $$bindings.regionInterface && regionInterface !== void 0)
    $$bindings.regionInterface(regionInterface);
  if ($$props.regionInterfaceText === void 0 && $$bindings.regionInterfaceText && regionInterfaceText !== void 0)
    $$bindings.regionInterfaceText(regionInterfaceText);
  if ($$props.slotLead === void 0 && $$bindings.slotLead && slotLead !== void 0)
    $$bindings.slotLead(slotLead);
  if ($$props.slotMessage === void 0 && $$bindings.slotMessage && slotMessage !== void 0)
    $$bindings.slotMessage(slotMessage);
  if ($$props.slotMeta === void 0 && $$bindings.slotMeta && slotMeta !== void 0)
    $$bindings.slotMeta(slotMeta);
  classesBase = `${cBase} ${border} ${padding} ${rounded} ${$$props.class ?? ""}`;
  classesInput = `${cInput}`;
  classesInterface = `${cInterface}`;
  return `<div class="${[
    "dropzone " + escape(classesBase, true),
    $$restProps.disabled ? "opacity-50" : ""
  ].join(" ").trim()}" data-testid="file-dropzone">  <input${spread(
    [
      { type: "file" },
      { name: escape_attribute_value(name) },
      {
        class: "dropzone-input " + escape(classesInput, true)
      },
      escape_object(prunedRestProps())
    ],
    {}
  )}>  <div class="${"dropzone-interface " + escape(classesInterface, true) + " " + escape(regionInterface, true)}"><div class="${"dropzone-interface-text " + escape(regionInterfaceText, true)}"> ${$$slots.lead ? `<div class="${"dropzone-lead " + escape(slotLead, true)}">${slots.lead ? slots.lead({}) : ``}</div>` : ``}  <div class="${"dropzone-message " + escape(slotMessage, true)}">${slots.message ? slots.message({}) : `<strong data-svelte-h="svelte-13uz6lq">Upload a file</strong> or drag and drop`}</div>  ${$$slots.meta ? `<small class="${"dropzone-meta " + escape(slotMeta, true)}">${slots.meta ? slots.meta({}) : ``}</small>` : ``}</div></div></div>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".btn.svelte-1p55edv{background-color:orangered;color:white}.button-container.svelte-1p55edv{margin-top:auto;width:100%;display:flex}div.svelte-1p55edv{margin:3%;border-radius:20px}.input.svelte-1p55edv{width:40%;border-radius:20px;padding-left:20px}.textarea.svelte-1p55edv{padding-left:20px;padding-top:10px}.card.svelte-1p55edv{position:absolute;left:47%;top:50%;transform:translate(-50%, -50%);border-radius:25px;width:30%;height:30%;display:flex;flex-direction:column;align-items:center;justify-content:center}.centered-image.svelte-1p55edv{margin-left:auto;margin-right:auto;width:100%}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let myId = nanoid();
  console.log(myId);
  let idea = {
    title: "",
    subtitle: "",
    description: "",
    image: "This is an image"
  };
  $$result.css.add(css);
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})} ${`<div class="svelte-1p55edv"><h1 class="h1" data-svelte-h="svelte-1n3vyml">Let&#39;s create a new idea! 🚀</h1> <br> <p data-svelte-h="svelte-1kjlbrm">Title</p> <input class="input svelte-1p55edv" type="search" name="demo" placeholder="Title"${add_attribute("value", idea.title, 0)}> <p data-svelte-h="svelte-q0asbs">Subtitle</p> <textarea class="textarea svelte-1p55edv" rows="4" placeholder="Subtitle">${escape("")}</textarea> <p data-svelte-h="svelte-1ob7rtu">Description</p> <label class="label"><textarea class="textarea svelte-1p55edv" rows="4" placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit.">${escape("")}</textarea></label> <p data-svelte-h="svelte-9uqgrt">Image</p> ${validate_component(FileDropzone, "FileDropzone").$$render($$result, { name: "files" }, {}, {
    meta: () => {
      return `PNG, JPEG, or GIFF allowed`;
    },
    message: () => {
      return `Upload an image`;
    },
    lead: () => {
      return `📁`;
    }
  })} <br> <div class="button-container svelte-1p55edv"><button type="button" class="btn variant-filled svelte-1p55edv" data-svelte-h="svelte-vt5ttr"><span>🚀</span> <span>Create!</span></button></div></div>`}`;
});
export {
  Page as default
};

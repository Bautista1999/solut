import { c as create_ssr_component, s as setContext, e as escape, i as add_attribute, h as compute_slots, b as compute_rest_props, k as getContext, d as spread, f as escape_attribute_value, g as escape_object, a as subscribe, v as validate_component } from "./ssr.js";
import "./ProgressBar.svelte_svelte_type_style_lang.js";
import { L as LightSwitch } from "./LightSwitch.js";
import { p as page } from "./stores.js";
const cBase$1 = "space-y-4";
const cList = "flex overflow-x-auto hide-scrollbar";
const cPanel = "";
const TabGroup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classesBase;
  let classesList;
  let classesPanel;
  let $$slots = compute_slots(slots);
  let { justify = "justify-start" } = $$props;
  let { border = "border-b border-surface-400-500-token" } = $$props;
  let { active = "border-b-2 border-surface-900-50-token" } = $$props;
  let { hover = "hover:variant-soft" } = $$props;
  let { flex = "flex-none" } = $$props;
  let { padding = "px-4 py-2" } = $$props;
  let { rounded = "rounded-tl-container-token rounded-tr-container-token" } = $$props;
  let { spacing = "space-y-1" } = $$props;
  let { regionList = "" } = $$props;
  let { regionPanel = "" } = $$props;
  let { labelledby = "" } = $$props;
  let { panel = "" } = $$props;
  setContext("active", active);
  setContext("hover", hover);
  setContext("flex", flex);
  setContext("padding", padding);
  setContext("rounded", rounded);
  setContext("spacing", spacing);
  if ($$props.justify === void 0 && $$bindings.justify && justify !== void 0)
    $$bindings.justify(justify);
  if ($$props.border === void 0 && $$bindings.border && border !== void 0)
    $$bindings.border(border);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.hover === void 0 && $$bindings.hover && hover !== void 0)
    $$bindings.hover(hover);
  if ($$props.flex === void 0 && $$bindings.flex && flex !== void 0)
    $$bindings.flex(flex);
  if ($$props.padding === void 0 && $$bindings.padding && padding !== void 0)
    $$bindings.padding(padding);
  if ($$props.rounded === void 0 && $$bindings.rounded && rounded !== void 0)
    $$bindings.rounded(rounded);
  if ($$props.spacing === void 0 && $$bindings.spacing && spacing !== void 0)
    $$bindings.spacing(spacing);
  if ($$props.regionList === void 0 && $$bindings.regionList && regionList !== void 0)
    $$bindings.regionList(regionList);
  if ($$props.regionPanel === void 0 && $$bindings.regionPanel && regionPanel !== void 0)
    $$bindings.regionPanel(regionPanel);
  if ($$props.labelledby === void 0 && $$bindings.labelledby && labelledby !== void 0)
    $$bindings.labelledby(labelledby);
  if ($$props.panel === void 0 && $$bindings.panel && panel !== void 0)
    $$bindings.panel(panel);
  classesBase = `${cBase$1} ${$$props.class ?? ""}`;
  classesList = `${cList} ${justify} ${border} ${regionList}`;
  classesPanel = `${cPanel} ${regionPanel}`;
  return `  <div class="${"tab-group " + escape(classesBase, true)}" data-testid="tab-group"> <div class="${"tab-list " + escape(classesList, true)}" role="tablist"${add_attribute("aria-labelledby", labelledby, 0)}>${slots.default ? slots.default({}) : ``}</div>  ${$$slots.panel ? `<div class="${"tab-panel " + escape(classesPanel, true)}" role="tabpanel"${add_attribute("aria-labelledby", panel, 0)} tabindex="0">${slots.panel ? slots.panel({}) : ``}</div>` : ``}</div>`;
});
const cBase = "text-center cursor-pointer transition-colors duration-100";
const cInterface = "";
const TabAnchor = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let classesActive;
  let classesBase;
  let classesInterface;
  let $$restProps = compute_rest_props($$props, ["selected", "controls", "active", "hover", "flex", "padding", "rounded", "spacing"]);
  let $$slots = compute_slots(slots);
  let { selected = false } = $$props;
  let { controls = "" } = $$props;
  let { active = getContext("active") } = $$props;
  let { hover = getContext("hover") } = $$props;
  let { flex = getContext("flex") } = $$props;
  let { padding = getContext("padding") } = $$props;
  let { rounded = getContext("rounded") } = $$props;
  let { spacing = getContext("spacing") } = $$props;
  function prunedRestProps() {
    delete $$restProps.class;
    return $$restProps;
  }
  if ($$props.selected === void 0 && $$bindings.selected && selected !== void 0)
    $$bindings.selected(selected);
  if ($$props.controls === void 0 && $$bindings.controls && controls !== void 0)
    $$bindings.controls(controls);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.hover === void 0 && $$bindings.hover && hover !== void 0)
    $$bindings.hover(hover);
  if ($$props.flex === void 0 && $$bindings.flex && flex !== void 0)
    $$bindings.flex(flex);
  if ($$props.padding === void 0 && $$bindings.padding && padding !== void 0)
    $$bindings.padding(padding);
  if ($$props.rounded === void 0 && $$bindings.rounded && rounded !== void 0)
    $$bindings.rounded(rounded);
  if ($$props.spacing === void 0 && $$bindings.spacing && spacing !== void 0)
    $$bindings.spacing(spacing);
  classesActive = selected ? active : hover;
  classesBase = `${cBase} ${flex} ${padding} ${rounded} ${classesActive} ${$$props.class ?? ""}`;
  classesInterface = `${cInterface} ${spacing}`;
  return `<a${spread(
    [
      {
        class: "tab-anchor " + escape(classesBase, true)
      },
      {
        href: escape_attribute_value($$props.href)
      },
      escape_object(prunedRestProps()),
      {
        "aria-controls": escape_attribute_value(controls)
      },
      { "data-testid": "tab-anchor" }
    ],
    {}
  )}> <div class="${"tab-interface " + escape(classesInterface, true)}">${$$slots.lead ? `<div class="tab-lead">${slots.lead ? slots.lead({}) : ``}</div>` : ``} <div class="tab-label">${slots.default ? slots.default({}) : ``}</div></div></a>`;
});
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_page();
  return `${validate_component(TabGroup, "TabGroup").$$render($$result, { class: "text-2xl px-10 py-5" }, {}, {
    default: () => {
      return `${validate_component(TabAnchor, "TabAnchor").$$render(
        $$result,
        {
          href: "/homepage",
          selected: $page.url.pathname === "/homepage"
        },
        {},
        {
          default: () => {
            return `Home`;
          }
        }
      )} ${validate_component(TabAnchor, "TabAnchor").$$render(
        $$result,
        {
          href: "/about",
          selected: $page.url.pathname === "/about"
        },
        {},
        {
          default: () => {
            return `About`;
          }
        }
      )} ${validate_component(TabAnchor, "TabAnchor").$$render(
        $$result,
        {
          href: "/about",
          selected: $page.url.pathname === "/about"
        },
        {},
        {
          default: () => {
            return `Profile`;
          }
        }
      )} ${validate_component(TabAnchor, "TabAnchor").$$render(
        $$result,
        {
          href: "/about",
          selected: $page.url.pathname === "/about"
        },
        {},
        {
          default: () => {
            return `Feed`;
          }
        }
      )} ${validate_component(TabAnchor, "TabAnchor").$$render(
        $$result,
        {
          href: "/about",
          selected: $page.url.pathname === "/about"
        },
        {},
        {
          default: () => {
            return `Wallet`;
          }
        }
      )} ${validate_component(TabAnchor, "TabAnchor").$$render(
        $$result,
        {
          href: "/about",
          selected: $page.url.pathname === "/about"
        },
        {},
        {
          default: () => {
            return `Contact`;
          }
        }
      )} ${validate_component(TabAnchor, "TabAnchor").$$render(
        $$result,
        {
          href: "/about",
          selected: $page.url.pathname === "/about"
        },
        {},
        {
          default: () => {
            return `Notifications`;
          }
        }
      )} ${validate_component(TabAnchor, "TabAnchor").$$render(
        $$result,
        {
          href: "/create",
          selected: $page.url.pathname === "/create"
        },
        {},
        {
          default: () => {
            return `<div data-svelte-h="svelte-1uiu94l"><button>Create</button></div>`;
          }
        }
      )} ${validate_component(TabAnchor, "TabAnchor").$$render($$result, {}, {}, {
        default: () => {
          return `${validate_component(LightSwitch, "LightSwitch").$$render($$result, {}, {}, {})}`;
        }
      })}`;
    }
  })}`;
});
export {
  Header as H,
  TabGroup as T
};

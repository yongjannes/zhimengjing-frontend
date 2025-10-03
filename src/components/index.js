import SvgIcon from "./SvgIcon/index.vue";
import AppTable from "./AppTable/index.vue";
import AppSearchForm from "./AppSearchForm/index.vue";

const components = {
  SvgIcon,
  AppTable,
  AppSearchForm,
};

export default {
  install(app) {
    Object.keys(components).forEach((key) => {
      app.component(key, components[key]);
    });
  },
};

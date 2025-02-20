import store from "App/store";
import {setServicesConfigIsReady} from "../settingsSlice";

export default class ServicesConfig {
  constructor() {
    this.firebaseConfig = null;

    this.unsubscribe = store.subscribe(this.handleStoreChange);
  }

  handleStoreChange = () => {
    // create
    const firebaseConfig =
      store.getState().settings.servicesConfig.firebaseConfig;
    if (this.firebaseConfig?.apiKey !== firebaseConfig?.apiKey) {
      this.firebaseConfig = firebaseConfig;
      store.dispatch(setServicesConfigIsReady(true));
    }
  };
}

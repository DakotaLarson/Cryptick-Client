import {WebServer} from "./WebServer";

class Application {
  public start() {
    const webServer = new WebServer();
    webServer.initialize();
  }
}

(() => {
  const app = new Application();
  app.start();
})();

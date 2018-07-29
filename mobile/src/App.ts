import { createStackNavigator } from "react-navigation"; // Version can be specified in package.json
import { HomeScreen } from "./screens/Home";
import { SplashScreen } from "./screens/Splash";
import { ImageInspect } from "./screens/ImageInspect";

export default createStackNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    Splash: {
      screen: SplashScreen
    },
    ImageInspect: {
      screen: ImageInspect
    }
  },
  {
    initialRouteName: "Splash"
  }
);

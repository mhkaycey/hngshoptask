import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "./lib/cart";

import ProductsScreen from "./screens/ProductsScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import OrdersScreen from "./screens/OrdersScreen";
import WishlistScreen from "./screens/WishlistScreen";
import ProfileScreen from "./screens/ProfileScreen";

export type RootStackParamList = {
  ProductsTabs: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Checkout: undefined;
};

export type MainTabParamList = {
  Shop: undefined;
  Wishlist: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShadowVisible: false, tabBarActiveTintColor: "#b45309" }}>
      <Tab.Screen name="Shop" component={ProductsScreen} options={{ title: "hngshop" }} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator>
            <Stack.Screen name="ProductsTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ title: "Product" }}
            />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Your cart" }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}

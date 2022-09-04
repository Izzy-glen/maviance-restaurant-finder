import * as WebBrowser from "expo-web-browser";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";

import Colors from "../constants/Colors";
import { Text, View } from "./Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditScreenInfo() {
  //Function to render each restaurant card item
  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.infoAreaB}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => handleVisitPress(item.url.complete)}
            style={styles.visitButton}
          >
            <Text lightColor={Colors.light.tint}>Visit🌍</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoArea}>
          <Image
            style={styles.tinyLogo}
            source={{
              uri: item.logo_url,
            }}
          />
          <View style={styles.restauInfo}>
            <Text
              style={styles.restauText}
            >{`🗺️ Address: ${item.location.street}, ${item.location.state} - ${item.location.zip}`}</Text>
            <Text
              style={styles.restauText}
            >{`⭐ Ratings: Ovr - ${item.ratings.overall_rating}/100 = ${item.ratings.star_rating}⭐, Total - ${item.ratings.num_ratings} rating(s)`}</Text>
            <Text style={styles.restauText}>{`🫕 Cuisines: ${item.cuisines.map(
              (cuisine) => `${cuisine}`
            )}  `}</Text>
          </View>
        </View>
      </View>
    );
  };

  const [text, setText] = useState("City, Zip");
  const [theme, setTheme] = useState();
  const [restaurants, setRestaurants] = useState([]);
  const [key, setKey] = useState();
  const [working, setWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [searching, setSearching] = useState(false);
  const [lastAddress, setLastAddress] = useState(false);

  const colorScheme = useColorScheme();

  // generating the key to perform our requests with and saving the generated key in asynchronous storage for persistence
  const keyGenerator = (address) => {
    //Custom solution for address from City, Zip to city_zip
    setWorking(true);

    if (address.includes(",")) {
      setWorking(true);
      const spaced = String(address)
        .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "")
        .trim();
      console.log("String with only space and no special characters", spaced);
      const separated = spaced.toLowerCase().split(" ");
      console.log(separated);
      let reunited = "";
      separated.map(
        (string) =>
          (reunited = reunited.length ? `${reunited}_${string}` : string)
      );
      console.log("Answer", reunited);
      setKey(reunited);
      console.log("Generated Key: ", reunited);
      handleSaveAddress(reunited);
      handleGetAddress();
      setWorking(false);

      return reunited;
    } else {
      setErrorMessage(
        "Please verify that your address is in the format `city`, `zip`."
      );
      return undefined;
    }
  };
  // console.log(key);
  // performing api fetch request to the submitted address
  const handleSearch = async (address) => {
    setWorking(true);

    console.log("Searching Key:", address);
    try {
      setSearching(true);
      let headersList = {
        Accept: "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      };

      let response = await fetch(
        `https://dcom-native-interview.s3.amazonaws.com/api/merchant/query/${address}`,
        {
          method: "GET",
          headers: headersList,
        }
      );

      let stringData = await response.text();
      console.log(stringData);

      let data = JSON.parse(stringData);
      setSearching(false);

      setRestaurants([...data.merchants]);
      setWorking(false);

      console.log(data);
    } catch (error) {
      console.log(error);
      setSearching(false);
      setWorking(false);
      setErrorMessage(error);
      createTwoButtonAlert(errorMessage, setErrorMessage);
    }

    return restaurants;
  };

  //  function to save address in AsyncStorage for persistence
  const handleSaveAddress = async (address) => {
    try {
      await AsyncStorage.setItem("address", address);
    } catch (e) {
      // saving error
      console.log(e);
    }
  };

  // function to retrieve saved address
  const handleGetAddress = async () => {
    try {
      setWorking(true);
      const value = await AsyncStorage.getItem("address");
      setLastAddress(value);
      console.log("Current address is: ", value);
      setWorking(false);
      return value;
    } catch (e) {
      // error reading value
    }
  };

  const createTwoButtonAlert = () =>
    Alert.alert(
      "Address Format Error",
      `Error. For demo Purposes select and copy one of the specified addresses`,
      [
        {
          text: "OK",
          onPress: () => setWorking(false),
          style: "default",
        },
      ]
    );
  const testAddresses = [
    "245 E 63rd St, 10065",
    "232 Willow Ave, 07030",
    "240 Kent Ave, 11249",
    "55 Water St, 10041",
  ];

  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text
          style={styles.getStartedText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Hungry? Find Restaurants around You 🥘
        </Text>

        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
          darkColor="rgba(255,255,255,0.05)"
          lightColor="rgba(0,0,0,0.05)"
        >
          <TextInput
            style={styles.input}
            onChangeText={setText}
            placeholder={"City, Zip"}
            lightColor="rgba(0,0,0,0.8)"
            darkColor="rgba(255,255,255,0.8)"
            onBlur={() => keyGenerator(text)}
          />
        </View>
      </View>

      <View style={styles.helpContainer}>
        <TouchableOpacity
          onPress={() => {
            const tempKey = keyGenerator(text);
            typeof tempKey === "string"
              ? handleSearch(tempKey)
              : createTwoButtonAlert(errorMessage, setErrorMessage);
          }}
          style={styles.helpLink}
        >
          <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
            👉🏿 Search 🚀
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        {working ? (
          <ActivityIndicator
            size="small"
            lightColor={searching ? "green" : "#000022"}
            darkColor={searching ? "green" : "#0000ff"}
          />
        ) : null}
      </View>
      <View>
        {restaurants.length ? (
          <View>
            <View style={styles.helpContainer}>
              <Text style={styles.footer} lightColor={Colors.light.tint}>
                {restaurants.length} Restaurants are Available Near You 🛎️
              </Text>
              <TouchableOpacity
                onPress={() => setRestaurants([])}
                style={styles.helpLink}
              >
                <Text style={styles.textLink} lightColor={Colors.light.tint}>
                  Change Location 🗺️
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardArea}>
              <FlatList
                data={restaurants}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.helpContainer}>
        <TouchableOpacity
          onPress={() => handleVisitPress("https://officialgda.com")}
          style={styles.helpLink}
        >
          <Text style={styles.footer} lightColor={Colors.light.tint}>
            Created By Glenhalton🥷🏿
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.helpContainer}>
        <Text selectable>Test Addresses:</Text>
        {testAddresses.map((address, index) => (
          <Text key={index} selectable>{`=> ${address}`}</Text>
        ))}
      </View>
      <View style={styles.helpContainer}>
        <Text selectable>Last Used Addresses: {lastAddress}</Text>
      </View>
    </View>
  );
}

function handleVisitPress(link) {
  WebBrowser.openBrowserAsync(link);
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    paddingVertical: 10,
  },
  textLink: {
    width: 200,
    textAlign: "center",
  },
  input: {
    width: 350,
    height: 50,
    fontSize: 18,
    borderRadius: 5,
    backgroundColor: "#fff",
    padding: 10,
    borderColor: "gray",
    borderWidth: 2,
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  helpLink: {
    paddingVertical: 15,
    borderRadius: 5,
    border: "1px solid #fff",
  },

  helpLinkText: {
    textAlign: "center",
    width: "100%",
    padding: 20,
    borderRadius: 5,
    border: "1px solid #fff",
  },
  item: {
    height: 100,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  cardArea: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: -700,
  },
  name: {
    fontSize: 19,
    marginHorizontal: 10,
    zIndex: 1,
    height: 30,
    overflow: "hidden",
    width: "80%",
  },
  card: {
    flex: 1,
    height: 100,
    marginVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderColor: "gray",
    borderWidth: 2,
    width: "85%",
    borderRadius: 5,
    alignContent: "center",
    justifyContent: "center",
  },
  tinyLogo: {
    borderRadius: 50,
    borderWidth: 3,
    color: "gray",
    height: 50,
    width: 50,
  },
  infoArea: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  infoAreaB: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  visitButton: {
    borderColor: "gray",
    borderWidth: 2,
    padding: 4,
    borderRadius: 50,
  },
  restauInfo: {
    display: "flex",
    paddingHorizontal: 10,
  },
  restauText: {
    fontSize: 11,
    overflow: "hidden",
  },
  footer: {
    textAlign: "center",
    width: "100%",
    padding: 10,
    borderRadius: 5,
    opacity: 50,
    fontSize: 11,
    color: "gray",
  },
});

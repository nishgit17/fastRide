import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Choice = () => {
  return (
    <View style={styles.container}>
      <Link href="/Dindex" asChild>
        <TouchableOpacity style={styles.button}>
          <Icon name="directions-car" size={24} color="blue" />
          <Text style={styles.buttonText}>SignIn as a Captain</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Icon name="person" size={24} color="red" />
          <Text style={styles.buttonText}>SignIn as a Rider</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 320,
    height: 80,
    backgroundColor: '#d1d5db', // light grey
    borderRadius: 30,
    flexDirection: 'row', // align icon and text side by side
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30, // spacing between buttons
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Choice;

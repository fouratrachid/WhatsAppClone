import { StatusBar } from 'expo-status-bar';
import { Button, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import firebase from './config';
import Home from './Home'; 
const auth = firebase.auth();

export default function Auth(props) {

    var email,pwd;
  return (
    <ImageBackground
    source={require("./assets/photo1.jpeg")}
    style={styles.container}>
      <View style={{
        backgroundColor:"#0005",
        height:300,
        width:'98%',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10,
      }}>
      <Text
        style={{
          fontSize :32,
          fontWeight: 'bold',
          fontStyle:'italic',
          color:'yellow',
        }}>
        Bienvenue
      </Text>
      <TextInput
      onChangeText={(txt)=>(
        email=txt
      )}
      keyboardType='email.address'
      placeholder='email@gmail.com'
      style={styles.textInputStyle}></TextInput>
      <TextInput
      onChangeText={(txt)=>(
        pwd=txt
      )}
      placeholder='password'
      secureTextEntry={true}
      style={styles.textInputStyle}></TextInput>
      <View style={{flexDirection:'row',gap:15,}}>
      <Button title='submit'
      onPress={()=>{
        auth.signInWithEmailAndPassword(email,pwd).then(()=>{
            props.navigation.navigate(Home);
            }
        ).catch((error)=>{
            alert(error.message);
        }
        );

      }}
      ></Button>
        <Button title='Exit'
      ></Button>
      </View>
      <Text
      onPress={()=>{
        props.navigation.navigate("NewUser");
      }}
      style={{
        width:"100%",
        textAlign:'right',
        paddingRight:20,
        color:'yellow',
        fontWeight:"bold",
        fontStyle:'italic',
      }}
      >
        Create new user
      </Text>
      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
   // alignItems:'flex-end', //align horize
   // justifyContent:'flex-start' //align vert
  },
  textInputStyle:{
    height:50 ,
    width:'90%',
    backgroundColor:'white',
    marginBottom:10,
  }
});
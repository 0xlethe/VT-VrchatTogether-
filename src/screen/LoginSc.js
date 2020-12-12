import React, { Component } from "react";
// common component
import {
    Button,
    Text,
} from "native-base";
import {
    View,
    TextInput,
    Alert,
    AsyncStorage,
    Linking,
    BackHandler,
    ImageBackground,
    Animated,
    Image,
    ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Actions } from 'react-native-router-flux';
import utf8 from "utf8";
import base64 from 'base-64';
import Modal from 'react-native-modal';
import {VRChatAPIGet, VRChatAPIGetAuth} from '../utils/ApiUtils';
import styles from '../css/css';
import {NetmarbleL,NetmarbleB} from '../utils/CssUtils';
import {translate, getLanguage, setLanguage} from '../translate/TranslateUtils';

export default class LoginSc extends Component {
    constructor(props) {
        super(props);
        getLanguage()

        this.state = {
            id: "",
            pw: "",
            loginCheck: true,
            loginFail: null,
            isPermit: false,
            aniPosition: new Animated.ValueXY({x:0,y:0}),
            loadingText: translate('loading')
        };
    }

    UNSAFE_componentWillMount() {
        AsyncStorage.getItem("storage_id",(err, value)=>{
            this.setState({
                id:value
            });
        });
        AsyncStorage.getItem("permit_check",(err, value)=>{
            this.setState({
                isPermit:value == "check" ? false : true
            });
        });
        this.loginCheck();
    }

    componentWillUnmount() {
    }

    componentDidMount() {
    }

    shakeAni() {
        Animated.sequence([
            Animated.timing(
                this.state.aniPosition,{
                    toValue : {x:7, y:0},
                    duration: 50,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                this.state.aniPosition,{
                    toValue : {x:-7, y:0},
                    duration: 50,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                this.state.aniPosition,{
                    toValue : {x:7, y:0},
                    duration: 50,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                this.state.aniPosition,{
                    toValue : {x:-7, y:0},
                    duration: 50,
                    useNativeDriver: true
                }
            ),
            Animated.timing(
                this.state.aniPosition,{
                    toValue : {x:0, y:0},
                    duration: 50,
                    useNativeDriver: true
                }
            )
        ]).start();
    }

    permit() {
        AsyncStorage.setItem("permit_check", "check");
        
        this.setState({
            isPermit: false
        });
    }

    loginCheck = async() =>
    {
        await fetch(`https://api.vrchat.cloud/api/1/auth/user`, VRChatAPIGet)
        .then((response) => response.json())
        .then((responseJson) => {
            if(!responseJson.error)
            {
                this.setState({
                    loginCheck:true,
                    loadingText: translate('msg_redirect_main')
                });
                setTimeout(()=>{
                    Actions.mainSc();
                },1000);
            }
            else if(responseJson.error)
            {
                this.setState({
                    loginCheck:false
                });
            }
        });
    }

    login = async() =>
    {
        // utf8 문자 감지 후 base64 변환
        const user = base64.encode(utf8.encode(this.state.id+":"+this.state.pw));

        await fetch(`https://api.vrchat.cloud/api/1/auth/user`, VRChatAPIGetAuth(user))
        .then(response => response.json())
        .then(responseJson => {
            if(!responseJson.error)
            {
                AsyncStorage.setItem("storage_id", this.state.id);
                setTimeout(()=>{
                    Actions.mainSc();
                },1000);
                this.setState({
                    loginFail: true
                });
            }
            else
            {
                this.setState({
                    loginFail: false
                });
                this.shakeAni();
            }
        });
    }
    
    render() {
        return (
            this.state.loginCheck == false ?
            <View style={{flex:1}}>
                <ImageBackground
                style={{width:"100%",height:"100%"}}
                source={require('../css/imgs/login_background.png')}>
                    <View style={styles.loginBox}>
                        <View style={{height:100, justifyContent:"center"}}>
                            {
                                this.state.loginFail == true ?
                                <View>
                                    <Animated.View style={{alignItems:"center",transform:[{translateX:this.state.aniPosition.x}]}}>
                                        <Icon name={"check-circle"} size={80} style={{color:"#279cff"}} />
                                    </Animated.View>
                                    <NetmarbleL style={{color:"#279cff",fontSize:14,textAlign:"center"}}>{translate('login_success')}</NetmarbleL>
                                </View>
                                : this.state.loginFail == false &&
                                <View>
                                    <Animated.View style={{alignItems:"center",transform:[{translateX:this.state.aniPosition.x}]}}>
                                        <Icon name={"x-circle"} size={80} style={{color:"#fc9090"}} />
                                    </Animated.View>
                                    <NetmarbleL style={{color:"#fc9090",fontSize:14,textAlign:"center"}}>{translate('login_fail')}</NetmarbleL>
                                </View>
                            }
                        </View>
                        <NetmarbleB style={{color:"#279cff",fontSize:35}}>
                            {translate('login')}
                        </NetmarbleB>
                        <View style={styles.loginTextBox}>
                            <TextInput 
                            placeholder={translate('email_placeholder')}
                            value={this.state.id}
                            onChangeText={(text)=>this.setState({id:text})}
                            onSubmitEditing={() => { this.secondTextInput.focus(); }}
                            style={{marginRight:"0%",width:"90%",fontFamily:"NetmarbleL"}}/>
                            <Icon name="user" size={25} style={{marginTop:15,color:"#888c8b"}}/>
                        </View>
                        <View style={[styles.loginTextBox,{marginTop:20}]}>
                            <TextInput 
                            ref={(input) => { this.secondTextInput = input; }}
                            placeholder={translate('password_placeholder')}
                            value={this.state.pw}
                            onChangeText={(text)=>this.setState({pw:text})}
                            onSubmitEditing={this.login.bind(this)}
                            secureTextEntry
                            style={{marginRight:"0%",width:"90%",fontFamily:"NetmarbleL"}}/>
                            <Icon name="lock" size={25} style={{marginTop:15,color:"#888c8b"}}/>
                        </View>
                        <View style={{flexDirection:"row",justifyContent:"space-around",marginTop:"10%",width:"80%"}}>
                            <Button
                            onPress={this.login.bind(this)}
                            style={[styles.requestButton,{width:"48%",borderWidth:0,backgroundColor:"#279cff"}]}>
                            <NetmarbleB style={{color:"white"}}>{translate('login')}</NetmarbleB>
                            </Button>
                            <Button
                            onPress={()=>Linking.openURL("https://api.vrchat.cloud/home/register")}
                            style={[styles.requestButton,{width:"48%",borderWidth:0,elevation:0}]}>
                            <NetmarbleB style={{color:"black"}}>{translate('register')}</NetmarbleB>
                            </Button>
                        </View>
                    </View>
                    <Modal
                    isVisible={this.state.isPermit}>
                        <View style={{backgroundColor:"#fff",padding:"5%",borderRadius:10}}>
                            <View style={{alignItems:"center"}}>
                                <NetmarbleB style={{fontSize:30}}>
                                {translate('information')}
                                </NetmarbleB>
                                <NetmarbleL style={{textAlign:"center"}}>
                                    {translate('msg_agreement_first')}<NetmarbleB>{translate('msg_agreement_unoffice')}</NetmarbleB>{translate('msg_agreement_second')}{'\n'}
                                    {translate('msg_agreement')}
                                </NetmarbleL>
                                <NetmarbleB>
                                    {translate('msg_agree_yn')}
                                </NetmarbleB>
                                <View style={{flexDirection:"row"}}>
                                    <Button 
                                    onPress={this.permit.bind(this)}
                                    style={[styles.requestButton,{width:"30%",height:40,margin:10,justifyContent:"center"}]}>
                                        <NetmarbleL>{translate('agree')}</NetmarbleL>
                                    </Button>
                                    <Button 
                                    onPress={()=>BackHandler.exitApp()}
                                    style={[styles.requestButton,{width:"30%",height:40,margin:10,justifyContent:"center"}]}>
                                        <NetmarbleL>{translate('disagree')}</NetmarbleL>
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </ImageBackground>
            </View>
            :
            <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
                <Image
                style={{flex:0.5,width:"90%",height:"90%",resizeMode:"contain"}}
                source={require('../css/imgs/logo.png')}></Image>
                <ActivityIndicator size={100}/>
                <NetmarbleL>{this.state.loadingText}</NetmarbleL>
            </View>
        );
    }
}
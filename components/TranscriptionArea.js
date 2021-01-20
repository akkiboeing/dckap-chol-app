import React from 'react';
import { StyleSheet } from 'react-native';
import Textarea from 'react-native-textarea';

import { AppLoading } from 'expo';
import { useFonts } from 'expo-font';

// Transcription Area component
const TranscriptionArea = (props) => {
    // load fonts using useFonts and store result in fontsLoaded
    const [fontsLoaded] = useFonts({
        'Catamaran': require('../assets/fonts/static/Catamaran-Regular.ttf'),
    });

    // if font ahs not been loaded, display splash screen until the font is loaded
    if(!fontsLoaded) {
        return <AppLoading />;
    }
    // once the font is laoded, display the transcription area
    else {
        return <Textarea
                containerStyle={styles.textareaContainer}
                style={(!props.style) ? styles.textarea : props.style }
                onChangeText={props.onChangeText}
                defaultValue={props.Value}
                placeholder={'செயலி வழிமுறைகள்:\n\n1. படியெடுத்தலைத் தொடங்க வட்ட சிவப்பு பொத்தானை அழுத்தவும்.\n2. படியெடுத்தலை நிறுத்த சதுர சிவப்பு பொத்தானை அழுத்தவும்.\n3. நிறுத்த பொத்தானை அழுத்திய பின் முடிவுகள் காண்பிக்கப்படும்.\n4. துல்லியமான முடிவுகளைப் பெற ஸ்மார்ட்போனை உங்கள் வாய்க்கு நெருக்கமாக வைத்து சத்தமாக பேசுங்கள்.\n\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t நன்றி'}
                placeholderTextColor={'#636363'}
                underlineColorAndroid={'transparent'}/>;
    }
};

// style for the transcription area
const styles = StyleSheet.create({
    textareaContainer: {
        top: -50,
        padding: 5,
        borderWidth: 0.3,
        borderColor: 'rgb(0, 0, 0)',
        height: "40%",
        width: "90%",
        maxHeight: "100%",
        borderRadius: 10
    },

    textarea: {
        textAlignVertical: 'top',  // hack android
        fontFamily: 'Catamaran',
        height: "100%",
        width: "100%", 
        maxHeight: "100%",
        maxWidth: "100%",
        fontSize: 14,
        color: '#333'
    }
})

// export transcription area as a component
export default TranscriptionArea;
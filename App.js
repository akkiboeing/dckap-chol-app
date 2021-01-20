import React, { Component } from 'react';
import { Alert, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import FileUploader from 'react-native-file-uploader';

import { Buffer } from 'buffer';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import  AudioRecord from 'react-native-audio-record';

import TranscriptionArea from './components/TranscriptionArea';
import ShareButton from './components/ShareButton';

import config from './config';

class App extends Component { 
  constructor(props) {
    super(props);

    // state object that can be invoked when recording button is pressed -> enable pressed state as true and change button style to stop button
    this.recordState = { isPressed: true, style: styles.stopButton };

    // state object that can be invoked when stop button is pressed -> enable pressed state as false and change button style to record button
    this.stopState = { isPressed: false, style: styles.recordButton };

    // state object to track recording state, button press state, transcription, style of the button as record
    this.state = { recording: false, isPressed: false, style: styles.recordButton, inputValue: '' };

    // set initial microphone permission as false
    this.permission = false;

    // recording options for miscrophone access
    // AI model is trained with 16000 Hz and single channel audio
    this.recordingOptions = {
        sampleRate: 16000,  // sample rate is 16000Hz
        channels: 1,        // Mono audio or single channel audio
        bitsPerSample: 16,  // 16 bits per audio chunk
        wavFile: 'record0.wav' // Name of wav file to be saved
    };

    // get server URL ( local server's URL is for testing )
    this.serverURL = config.SERVER_URL;
    this.localURL = config.LOCAL_URL;

    // audio upload configuration for uplaoding to the server
    this.uploadSettings = {
      uri: this.state.audioFile, // Audio file's URI
      uploadUrl: this.serverURL, // Server's URL
      method: 'POST', // POST method
      fileName: 'record0.wav', // name of the audio file
      fieldName: 'file', // name of the field that is accepted by the server API
      contentType: 'audio/wav', // TYpe of the file is Audio and it is in wav format, so 'audio/wav'
    };
  }

  // componentDidMount method
  // When app's components are mounted on the app while loading, componentDidMount function is enabled
  async componentDidMount() {
      // check for microphone permission
      await this.checkPermission()
          .then(() => {
            // set microphone permission as true
            this.permission = true; 
            
            console.log('Permission Given');
          })
          .catch(() => {
            console.log('Permission Not Given');
          });

      // initalize audio recorder object with
      AudioRecord.init(this.recordingOptions);

      // Log message
      console.log('Initialized Audio Recorder!');

      // Whenevr the audio recorder object is invoked, the on method is used to process those audio chunks
      // The audio chunks are converted into BASE64 encoded arrays
      // these are gathered automatically and saved as wav file under given name once the recording is stopped
      AudioRecord.on('data', data => {
        const chunk = Buffer.from(data, 'base64');
      });
  }

  // requestPermission method
  // To request microphone access permission from the user
  requestPermission = async () => {
    // request Record Audio permission
    const p = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
    console.log('Permission Request: ', p);
  };

  // checkPermission method
  // To check if the micrphone access permission has already been granted by the user for the app
  checkPermission = async () => {
      // check Record Audio permission
      const p = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
      // log permission
      console.log('Permission Check: ', p);
      // If permission is given log as Authorized
      if (p === RESULTS.GRANTED) 
      { 
          this.permission = true; 
          console.log("Authorized!");
          return; 
      }
      // If permissions are unavailable, microphone is not available/can't access
      // request for permission
      else if (p === RESULTS.UNAVAILABLE) 
      { 
          console.log("Microphone not available!");
          return this.requestPermission();
      }
      // If not eitehr of those messages, then the user has not authorized microphone for access
      // reuqest for permission
      else {
        console.log("Unauthorized!");
        return this.requestPermission();
      }
  };

  // startRecording method
  // Records audio using microphone
  startRecording = () => {
    try {
      console.log('Started recording');
      // chnage state as recording, set audioFile uri as empty and microphone loaded as false since it is not being used yet
      this.setState({ audioFile: '', recording: true, loaded: false });
      //  start recording
      AudioRecord.start();
    }
    catch(err) {
      console.log(err);
      // Display alert message in case of microphone error
      Alert.alert(
        'Microphone access error'
     );
    }
  };

  // stopRecording method
  // Stops recording audio and saves it as wav file
  stopRecording = async () => {
      console.log('Stopped recording');
      // if recording is not enabled, return nothing
      if (!this.state.recording) return;
      // Stop recording, save audio file and get the URI of the audio file
      let audioFile = await AudioRecord.stop();
      // set state with audioFile URI and recording as false to unload the microphone
      this.setState({ audioFile, recording: false });
  };

  // uploadAudioData method
  // Uploads audio file and updates transcription on the app received form server
  uploadAudioData = () => {
    FileUploader.upload(this.uploadSettings, (err, res) => {      
      try {
        // receive JSON data from the server
        var json_res = JSON.parse(JSON.stringify(res));
        //  get tanscription data from the parsed JSON
        var transcription = JSON.parse(JSON.stringify(json_res['data']));
        // set new input value for the text area
        // Concat new transcription string with old transcription string and add a space
        var newInputValue = this.state.inputValue.concat(transcription.concat(' '));
        // set text to be displayed in the text area as the enw Transcription data
        this.setState({ inputValue: newInputValue });
      }
      // In case of server error, display Alert message to the user
      catch(err)
      {
        console.log(err);
        Alert.alert(
          'Server is busy. Try again later.'
       );
      }
    }, (sent, expectedToSend) => {
      // handle progress
      // console.log(sent);
      // console.log(expectedToSend);
    });
  }
  
  // stopTranscribing method
  // Stops recording, uploads audio data, and updates transcirption on the app
  stopTranscribing = () => {
    this.stopRecording().then( this.uploadAudioData ).catch(() => {console.log("Upload Error")});
  }
  
  // change style of the button to record and stop styles based on the press state of the button
  changeStyle = () => {
    // if button is pressed, recording is enabled, change style to stop button
    if(!this.state.isPressed){
      this.setState(this.recordState);
    }
    // else set state to not recording, and chnage style to record button
    else
    {
      this.setState({ recordState: true });
      this.setState(this.stopState);
    }
  };
  
  // updateInputText method
  // Update text on user input by setting inputValue state as the text entered in the text area
  updateInputText = (inputText) => {
    this.setState({ inputValue: inputText });
  }; 

  // render method
  // Renders and displays the app with the specified components
  render() {
      return (
          // Main Container or Display Space
          <View style={ styles.container }>
            {/* Logo Container */}
            <View style={ styles.logoContainer }>
              <Image
                style={ styles.logoImage }
                source={require('./assets/main_logo.png')}
              />
            </View>

            {/* Transcription Text area */}
            <TranscriptionArea Value={ this.state.inputValue } onChangeText={ this.updateInputText }/>

            {/* Record button area */}
            <View style={ styles.recordArea }>
              {/* Using TouchableOpacity as button */}
              <TouchableOpacity style={ this.state.style } activeOpacity={ 0.8 } onPress={ 
                      (props) => {
                          // chnage style dynamically between record and stop on press
                          this.changeStyle(); 
                          
                          // if button is pressed , record
                          if (!this.state.isPressed) {
                            this.startRecording();
                          }
                          // else stop transcribing and chnage results on the transcription area
                          else {
                            this.stopTranscribing();
                          }
                      }
                  }>
                </TouchableOpacity>
                {/* <Pressable style={ this.state.style } onPressIn={ () => {
                  this.changeStyle(); 
                          
                  if (!this.state.isPressed) {
                    this.startRecording();
                  }
                } }
                onPressOut={ () => {
                  this.changeStyle(); 
                          
                  if (this.state.isPressed) {
                    this.stopTranscribing();
                  }
                } }> 
              </Pressable> */ }
            </View>
            {/* Share button area */}
            <View style={ styles.shareArea }>
              <ShareButton Value={ this.state.inputValue } />
            </View>

        </View>
      );
    }
}

// Style sheet for app components and containers
const styles = StyleSheet.create({
  // main view
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // logo view
  logoContainer : {
    flex: 0,
    top: -150,
    bottom: 100,
    height: 0
  },

  // logo image style
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: 'stretch'
  },

  // record button area 
  recordArea: {
    flex: 0,
    top: -20
  },

  // share button area
  shareArea: {
    flex: 0,
    top: 10
  },

  // rounded - record button style 
  recordButton: { 
    alignItems:'center',
    justifyContent:'center',
    width: 60,
    height: 60,
    backgroundColor:'#f54272',
    borderRadius: 100,
    elevation: 2
  },

  // squared - stop button style
  stopButton: { 
    alignItems:'center',
    justifyContent:'center',
    width: 57.5,
    height: 57.5,
    backgroundColor:'#f54272',
    borderRadius: 15,
    elevation: 2
  }
});

// Export App component for registering as main app
export default App;
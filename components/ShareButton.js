import React from 'react';
import { TouchableOpacity, StyleSheet, Share } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// function to share message on apps installed on user's phone
const shareMessage = (inputValue) => {
    // share input value present in the transcription area
    Share.share({
      message: inputValue.toString(),
    })
    // on successful share, log result
    .then((result) => console.log(result))
    // on failure, log error message
    .catch((errorMsg) => console.log(errorMsg));
};

// ShareButton that uses shareMessage function
const ShareButton = (props) => {
    return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.buttonStyle}
          onPress={() => shareMessage(props.Value) }>
              <Icon name="share"
                size={25}
                style={{ elevation: 2 }}
                color="#f54272"/>
          </TouchableOpacity>
    );
};

// style for the share button
const styles = StyleSheet.create({
    buttonStyle: {
        justifyContent: 'center',
        marginTop: 15,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        marginRight: 2,
        marginLeft: 2,
        borderRadius: 50,
        borderWidth: 0.3,
        borderColor: 'rgba(0, 0, 0, 0.7)'
      },
    
    buttonTextStyle: {
      color: '#000',
      textAlign: 'center',
    }
})

// export ShareButton as a component
export default ShareButton;
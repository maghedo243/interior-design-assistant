import { useState, useEffect } from 'react';
import { Text } from 'react-native';
// comment

export default function TypewriterText({ text, style, delay = 200}) {
  const [typedText, setTypedText] = useState('');


  useEffect(() => {
    let i = 0;
    let curtext = "";

    setTypedText("");

    const typingInterval = setInterval(() => {

        if(i< text.length ) {
            curtext += text.charAt(i);
            setTypedText(curtext);
            i++

        }else{
            clearInterval(typingInterval)
        }
    }, delay)
    return () => clearInterval(typingInterval);



  }, [text, delay]);

  return <Text style={style}>{typedText}</Text>
}
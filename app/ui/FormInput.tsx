import colors from "@utils/colors";
import { useState } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

interface Props extends TextInputProps {}

export default function FormInput(props: Props) {

    const [isFocused, setIsFocused] = useState(false);

    return (
        <TextInput
            style={[
                styles.input,
                isFocused ? styles.borderActive : styles.borderDeActive,
            ]}
            placeholderTextColor={colors.primary}
            onFocus={() => {
                setIsFocused(true);
            }}
            onBlur={() => {
                setIsFocused(false);
            }} 
            {...props}
        />
        
    )
}

const styles = StyleSheet.create({
    input: {
        width: "100%",
        padding: 8,
        borderRadius: 5,
        marginBottom: 15,
    },
    borderDeActive: { 
        borderWidth: 1, 
        borderColor: colors.deActive 
    },
    borderActive: { 
        borderWidth: 1, 
        borderColor: colors.primary 
    },
});
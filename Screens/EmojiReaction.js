// EmojiReactions.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const EmojiReactions = ({ onSelect }) => {
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '👏'];

    return (
        <View style={styles.container}>
            {emojis.map((emoji, index) => (
                <TouchableOpacity key={index} onPress={() => onSelect(emoji)}>
                    <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    emoji: {
        fontSize: 24,
        marginHorizontal: 5,
    },
});

export default EmojiReactions;
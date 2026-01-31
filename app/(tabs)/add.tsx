import { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORIES = [
  'Free Entry - Tip Optional',
  'Ticketed',
  'Free Entry - No Payment',
  'After-Hours',
];

const LOCATIONS = ['Providence', 'Warwick', 'Newport', 'Other'];

export default function AddEventScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a moment title');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }
    if (!selectedLocation) {
      Alert.alert('Missing Information', 'Please select a location');
      return;
    }
    if (selectedLocation === 'Other' && !customLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter a custom location');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Missing Information', 'Please enter a date');
      return;
    }
    if (!startTime.trim()) {
      Alert.alert('Missing Information', 'Please enter a start time');
      return;
    }
    if (!endTime.trim()) {
      Alert.alert('Missing Information', 'Please enter an end time');
      return;
    }
    if (selectedCategory === 'Ticketed' && !minimumPrice.trim()) {
      Alert.alert('Missing Information', 'Please enter a minimum price for ticketed events');
      return;
    }

    // TODO: Submit event to backend
    const eventData = {
      title,
      description,
      category: selectedCategory,
      location: selectedLocation === 'Other' ? customLocation : selectedLocation,
      date,
      startTime,
      endTime,
      venue,
      organizer,
      contactEmail,
      ...(selectedCategory === 'Ticketed' && { minimumPrice }),
    };

    console.log('Moment submitted:', eventData);
    
    Alert.alert(
      'Success',
      'Your moment has been submitted!',
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setTitle('');
            setDescription('');
            setSelectedCategory('');
            setSelectedLocation('');
            setCustomLocation('');
            setDate('');
            setStartTime('');
            setEndTime('');
            setVenue('');
            setOrganizer('');
            setContactEmail('');
            setMinimumPrice('');
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Add Event
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Share what's happening in your community
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Event Title */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Event Title *</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., Summer Jazz Night"
              placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Category *</ThemedText>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <ThemedText
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Location *</ThemedText>
            <View style={styles.locationGrid}>
              {LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationChip,
                    selectedLocation === location && styles.locationChipActive,
                  ]}
                  onPress={() => setSelectedLocation(location)}
                >
                  <ThemedText
                    style={[
                      styles.locationChipText,
                      selectedLocation === location && styles.locationChipTextActive,
                    ]}
                  >
                    {location}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            {selectedLocation === 'Other' && (
              <TextInput
                style={[styles.input, styles.inputMarginTop, { color: colors.text }]}
                placeholder="Enter location"
                placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
                value={customLocation}
                onChangeText={setCustomLocation}
              />
            )}
            
            {/* Placeholder for address entry and map selection */}
            <View style={styles.addressMapPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                📍 Address entry and map selection coming soon
              </ThemedText>
            </View>
          </View>

          {/* Venue */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Venue Name</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., The Rooftop Bar"
              placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
              value={venue}
              onChangeText={setVenue}
            />
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Date *</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
              value={date}
              onChangeText={setDate}
            />
          </View>

          {/* Start and End Time */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Start Time *</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="7:00 PM"
                placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>End Time *</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="11:00 PM"
                placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>

          {/* Minimum Price (conditional) */}
          {selectedCategory === 'Ticketed' && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Minimum Price *</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="$0.00"
                placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
                value={minimumPrice}
                onChangeText={setMinimumPrice}
                keyboardType="decimal-pad"
              />
            </View>
          )}

          {/* Description */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text }]}
              placeholder="Tell people what to expect..."
              placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Organizer */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Organizer Name</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Your name or organization"
              placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
              value={organizer}
              onChangeText={setOrganizer}
            />
          </View>

          {/* Contact Email */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Contact Email</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="contact@example.com"
              placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
          >
            <ThemedText style={styles.submitButtonText}>Create Event</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.disclaimer}>
            * Required fields
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      opacity: 0.7,
    },
    form: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      opacity: 0.9,
    },
    input: {
      backgroundColor: colors.background === '#F6F3E8' ? '#FFFFFF' : '#1A1410',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.icon,
    },
    inputMarginTop: {
      marginTop: 12,
    },
    textArea: {
      minHeight: 100,
      paddingTop: 16,
    },
    categoryGrid: {
      gap: 12,
    },
    categoryButton: {
      backgroundColor: colors.background === '#F6F3E8' ? '#FFFFFF' : '#1A1410',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.icon,
      alignItems: 'center',
    },
    categoryButtonActive: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },
    categoryButtonText: {
      fontSize: 15,
      fontWeight: '500',
    },
    categoryButtonTextActive: {
      color: colors.background === '#F6F3E8' ? '#0F0A08' : '#F6F3E8',
      fontWeight: '600',
    },
    locationGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    locationChip: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: colors.background === '#F6F3E8' ? '#FFFFFF' : '#1A1410',
      borderWidth: 1,
      borderColor: colors.icon,
    },
    locationChipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    locationChipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    locationChipTextActive: {
      color: '#0F0A08',
      fontWeight: '600',
    },
    addressMapPlaceholder: {
      marginTop: 16,
      padding: 20,
      backgroundColor: colors.background === '#F6F3E8' ? '#FFFFFF' : '#1A1410',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.icon,
      borderStyle: 'dashed',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: 14,
      opacity: 0.6,
      textAlign: 'center',
    },
    rowInputs: {
      flexDirection: 'row',
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    submitButton: {
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    submitButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.background === '#F6F3E8' ? '#0F0A08' : '#F6F3E8',
    },
    disclaimer: {
      fontSize: 13,
      opacity: 0.6,
      textAlign: 'center',
      marginTop: 16,
    },
  });

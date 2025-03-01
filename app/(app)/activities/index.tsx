import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { useAuth } from '../../context/auth';
import { Brain, Trophy, Timer, Star, Plus, X, Settings, Play, ArrowLeft } from 'lucide-react-native';

export default function ActivitiesScreen() {
  const { user, getGames, addGame, getPatientDetails } = useAuth();
  const isPatient = user?.role === 'patient';
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [connectedPatients, setConnectedPatients] = useState([]);
  
  // Form state for creating a new game
  const [gameTitle, setGameTitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gameDifficulty, setGameDifficulty] = useState('Easy');
  const [gameDuration, setGameDuration] = useState('5-10 min');

  useEffect(() => {
    // Get connected patients if caretaker
    if (user?.role === 'caretaker' && user.connectedPatients) {
      const patients = user.connectedPatients.map(id => getPatientDetails(id)).filter(Boolean);
      setConnectedPatients(patients);
      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].id);
      }
    }

    // Get games for the appropriate user
    const patientId = isPatient ? user?.id : selectedPatientId;
    if (patientId) {
      const patientGames = getGames(patientId);
      setGames(patientGames);
    }
  }, [user, selectedPatientId]);

  const handleAddGame = async () => {
    if (!gameTitle.trim() || !gameDescription.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const patientId = selectedPatientId;
      if (!patientId) {
        Alert.alert('Error', 'No patient selected');
        return;
      }

      await addGame({
        title: gameTitle,
        description: gameDescription,
        difficulty: gameDifficulty,
        duration: gameDuration,
        patientId,
        icon: 'Brain',
      });

      // Refresh games
      const updatedGames = getGames(patientId);
      setGames(updatedGames);
      
      // Reset form
      setGameTitle('');
      setGameDescription('');
      setGameDifficulty('Easy');
      setGameDuration('5-10 min');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add game');
    }
  };

  const handlePatientChange = (patientId) => {
    setSelectedPatientId(patientId);
    const patientGames = getGames(patientId);
    setGames(patientGames);
  };

  const startGame = (game) => {
    setSelectedGame(game);
    setIsPlaying(true);
    setGameScore(0);
  };

  const endGame = () => {
    setIsPlaying(false);
    setSelectedGame(null);
  };

  // Simple memory game implementation
  const MemoryGame = ({ game }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
      // Initialize cards
      const cardValues = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝'];
      const gameDifficulty = game.difficulty === 'Easy' ? 4 : game.difficulty === 'Medium' ? 6 : 8;
      const selectedValues = cardValues.slice(0, gameDifficulty);
      
      // Create pairs
      const cardPairs = [...selectedValues, ...selectedValues];
      
      // Shuffle
      const shuffled = cardPairs.sort(() => Math.random() - 0.5);
      
      // Create card objects
      const cardObjects = shuffled.map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false
      }));
      
      setCards(cardObjects);
    }, [game]);

    const handleCardClick = (id) => {
      // Don't allow flipping if already matched or already flipped
      if (matched.includes(id) || flipped.includes(id) || flipped.length === 2) {
        return;
      }

      // Flip the card
      const newFlipped = [...flipped, id];
      setFlipped(newFlipped);
      
      // If two cards are flipped, check for a match
      if (newFlipped.length === 2) {
        setMoves(moves + 1);
        
        const [firstId, secondId] = newFlipped;
        const firstCard = cards.find(card => card.id === firstId);
        const secondCard = cards.find(card => card.id === secondId);
        
        if (firstCard.value === secondCard.value) {
          // Match found
          setMatched([...matched, firstId, secondId]);
          setGameScore(gameScore + 10);
          setFlipped([]);
          
          // Check if game is over
          if (matched.length + 2 === cards.length) {
            setGameOver(true);
          }
        } else {
          // No match, flip back after a delay
          setTimeout(() => {
            setFlipped([]);
          }, 1000);
        }
      }
    };

    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={endGame} style={styles.backButton}>
            <ArrowLeft color="#333" size={24} />
            <Text style={styles.backButtonText}>Exit Game</Text>
          </TouchableOpacity>
          <View style={styles.gameStats}>
            <Text style={styles.gameStatText}>Moves: {moves}</Text>
            <Text style={styles.gameStatText}>Score: {gameScore}</Text>
          </View>
        </View>
        
        {gameOver ? (
          <View style={styles.gameOverContainer}>
            <Trophy color="#FFD700" size={64} />
            <Text style={styles.gameOverTitle}>Congratulations!</Text>
            <Text style={styles.gameOverScore}>Final Score: {gameScore}</Text>
            <Text style={styles.gameOverMoves}>Completed in {moves} moves</Text>
            <TouchableOpacity style={styles.playAgainButton} onPress={endGame}>
              <Text style={styles.playAgainButtonText}>Play Another Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameInstructions}>Match pairs of cards to train your memory</Text>
            
            <View style={styles.cardsContainer}>
              {cards.map(card => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.card,
                    (flipped.includes(card.id) || matched.includes(card.id)) && styles.cardFlipped
                  ]}
                  onPress={() => handleCardClick(card.id)}
                >
                  {(flipped.includes(card.id) || matched.includes(card.id)) ? (
                    <Text style={styles.cardText}>{card.value}</Text>
                  ) : (
                    <Text style={styles.cardText}>?</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  // Word puzzle game implementation
  const WordPuzzleGame = ({ game }) => {
    const [gameOver, setGameOver] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [message, setMessage] = useState('');
    
    const levels = [
      { scrambled: 'EALPP', answer: 'APPLE' },
      { scrambled: 'ANABAN', answer: 'BANANA' },
      { scrambled: 'RGEOAN', answer: 'ORANGE' },
      { scrambled: 'WBRREYARTS', answer: 'STRAWBERRY' },
    ];

    const checkAnswer = () => {
      if (userInput.toUpperCase() === levels[currentLevel].answer) {
        setGameScore(gameScore + 20);
        setMessage('Correct! Great job!');
        
        if (currentLevel < levels.length - 1) {
          setTimeout(() => {
            setCurrentLevel(currentLevel + 1);
            setUserInput('');
            setMessage('');
          }, 1500);
        } else {
          setGameOver(true);
        }
      } else {
        setMessage('Try again!');
      }
    };

    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={endGame} style={styles.backButton}>
            <ArrowLeft color="#333" size={24} />
            <Text style={styles.backButtonText}>Exit Game</Text>
          </TouchableOpacity>
          <View style={styles.gameStats}>
            <Text style={styles.gameStatText}>Level: {currentLevel + 1}/{levels.length}</Text>
            <Text style={styles.gameStatText}>Score: {gameScore}</Text>
          </View>
        </View>
        
        {gameOver ? (
          <View style={styles.gameOverContainer}>
            <Trophy color="#FFD700" size={64} />
            <Text style={styles.gameOverTitle}>Congratulations!</Text>
            <Text style={styles.gameOverScore}>Final Score: {gameScore}</Text>
            <Text style={styles.gameOverMoves}>You completed all levels!</Text>
            <TouchableOpacity style={styles.playAgainButton} onPress={endGame}>
              <Text style={styles.playAgainButtonText}>Play Another Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameInstructions}>Unscramble the letters to form a word</Text>
            
            <View style={styles.puzzleContainer}>
              <Text style={styles.scrambledWord}>{levels[currentLevel].scrambled}</Text>
              
              <TextInput
                style={styles.puzzleInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Enter your answer"
                autoCapitalize="characters"
              />
              
              {message ? (
                <Text style={[
                  styles.feedbackMessage,
                  message === 'Correct! Great job!' ? styles.correctMessage : styles.incorrectMessage
                ]}>
                  {message}
                </Text>
              ) : null}
              
              <TouchableOpacity style={styles.checkButton} onPress={checkAnswer}>
                <Text style={styles.checkButtonText}>Check Answer</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  // Pattern recognition game implementation
  const PatternGame = ({ game }) => {
    const [gameOver, setGameOver] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [message, setMessage] = useState('');
    
    const levels = [
      {
        sequence: [2, 4, 6, 8],
        options: [10, 12, 14],
        answer: 10
      },
      {
        sequence: [1, 3, 6, 10],
        options: [15, 16, 18],
        answer: 15
      },
      {
        sequence: [3, 6, 12, 24],
        options: [36, 48, 60],
        answer: 48
      }
    ];

    const checkAnswer = () => {
      if (selectedOption === levels[currentLevel].answer) {
        setGameScore(gameScore + 30);
        setMessage('Correct! Great job!');
        
        if (currentLevel < levels.length - 1) {
          setTimeout(() => {
            setCurrentLevel(currentLevel + 1);
            setSelectedOption(null);
            setMessage('');
          }, 1500);
        } else {
          setGameOver(true);
        }
      } else {
        setMessage('Try again!');
      }
    };

    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={endGame} style={styles.backButton}>
            <ArrowLeft color="#333" size={24} />
            <Text style={styles.backButtonText}>Exit Game</Text>
          </TouchableOpacity>
          <View style={styles.gameStats}>
            <Text style={styles.gameStatText}>Level: {currentLevel + 1}/{levels.length}</Text>
            <Text style={styles.gameStatText}>Score: {gameScore}</Text>
          </View>
        </View>
        
        {gameOver ? (
          <View style={styles.gameOverContainer}>
            <Trophy color="#FFD700" size={64} />
            <Text style={styles.gameOverTitle}>Congratulations!</Text>
            <Text style={styles.gameOverScore}>Final Score: {gameScore}</Text>
            <Text style={styles.gameOverMoves}>You completed all levels!</Text>
            <TouchableOpacity style={styles.playAgainButton} onPress={endGame}>
              <Text style={styles.playAgainButtonText}>Play Another Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameInstructions}>Find the next number in the sequence</Text>
            
            <View style={styles.patternContainer}>
              <View style={styles.sequenceContainer}>
                {levels[currentLevel].sequence.map((num, index) => (
                  <View key={index} style={styles.sequenceItem}>
                    <Text style={styles.sequenceNumber}>{num}</Text>
                  </View>
                ))}
                <View style={styles.sequenceItem}>
                  <Text style={styles.sequenceNumber}>?</Text>
                </View>
              </View>
              
              <Text style={styles.optionsLabel}>Select the next number:</Text>
              
              <View style={styles.optionsContainer}>
                {levels[currentLevel].options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedOption === option && styles.optionButtonSelected
                    ]}
                    onPress={() => setSelectedOption(option)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selectedOption === option && styles.optionButtonTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {message ? (
                <Text style={[
                  styles.feedbackMessage,
                  message === 'Correct! Great job!' ? styles.correctMessage : styles.incorrectMessage
                ]}>
                  {message}
                </Text>
              ) : null}
              
              <TouchableOpacity 
                style={[styles.checkButton, !selectedOption && styles.checkButtonDisabled]}
                onPress={checkAnswer}
                disabled={!selectedOption}
              >
                <Text style={styles.checkButtonText}>Check Answer</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderGame = () => {
    if (!selectedGame) return null;
    
    switch(selectedGame.title) {
      case 'Memory Match':
        return <MemoryGame game={selectedGame} />;
      case 'Word Puzzle':
        return <WordPuzzleGame game={selectedGame} />;
      case 'Pattern Recognition':
        return <PatternGame game={selectedGame} />;
      default:
        // Default to memory game
        return <MemoryGame game={selectedGame} />;
    }
  };

  const PatientActivities = () => (
    <ScrollView style={styles.container}>
      {isPlaying ? (
        renderGame()
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Brain Training Games</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Trophy color="#FFD700" size={24} />
                <Text style={styles.statValue}>1,250</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <Timer color="#4A90E2" size={24} />
                <Text style={styles.statValue}>45</Text>
                <Text style={styles.statLabel}>Minutes Today</Text>
              </View>
              <View style={styles.statItem}>
                <Star color="#50C878" size={24} />
                <Text style={styles.statValue}>Level 5</Text>
                <Text style={styles.statLabel}>Current Level</Text>
              </View>
            </View>
          </View>

          <View style={styles.gamesContainer}>
            {games.map(game => (
              <TouchableOpacity key={game.id} style={styles.gameCard} onPress={() => startGame(game)}>
                <Brain color="#4A90E2" size={32} />
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameDescription}>{game.description}</Text>
                  <View style={styles.gameMetaContainer}>
                    <Text style={styles.gameMeta}>{game.difficulty}</Text>
                    <Text style={styles.gameMeta}>{game.duration}</Text>
                  </View>
                </View>
                <Play color="#4A90E2" size={24} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );

  const CaretakerActivities = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Activity Management</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>John's Activity Summary</Text>
            <Text style={styles.progressDate}>Last 7 Days</Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>12</Text>
              <Text style={styles.progressLabel}>Games Completed</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>3.5h</Text>
              <Text style={styles.progressLabel}>Total Time</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>85%</Text>
              <Text style={styles.progressLabel}>Accuracy</Text>
            </View>
          </View>
        </View>
      </View>

      {connectedPatients.length > 0 && (
        <View style={styles.patientSelector}>
          <Text style={styles.selectorLabel}>Select Patient:</Text>
          <View style={styles.patientButtons}>
            {connectedPatients.map(patient => (
              <TouchableOpacity
                key={patient.id}
                style={[
                  styles.patientButton,
                  selectedPatientId === patient.id && styles.patientButtonActive
                ]}
                onPress={() => handlePatientChange(patient.id)}
              >
                <Text 
                  style={[
                    styles.patientButtonText,
                    selectedPatientId === patient.id && styles.patientButtonTextActive
                  ]}
                >
                  {patient.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Games</Text>
        {games.map(game => (
          <View key={game.id} style={styles.managementCard}>
            <Brain color="#4A90E2" size={24} />
            <View style={styles.managementInfo}>
              <Text style={styles.managementTitle}>{game.title}</Text>
              <Text style={styles.managementDescription}>{game.description}</Text>
              <View style={styles.gameMetaContainer}>
                <Text style={styles.gameMeta}>{game.difficulty}</Text>
                <Text style={styles.gameMeta}>{game.duration}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.managementButton}>
              <Settings color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <>
      {isPatient ? <PatientActivities /> : <CaretakerActivities />}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Game</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Game Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Memory Match"
                value={gameTitle}
                onChangeText={setGameTitle}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the game..."
                value={gameDescription}
                onChangeText={setGameDescription}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultyButtons}>
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    gameDifficulty === 'Easy' && styles.difficultyButtonActive
                  ]}
                  onPress={() => setGameDifficulty('Easy')}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    gameDifficulty === 'Easy' && styles.difficultyButtonTextActive
                  ]}>Easy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    gameDifficulty === 'Medium' && styles.difficultyButtonActive
                  ]}
                  onPress={() => setGameDifficulty('Medium')}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    gameDifficulty === 'Medium' && styles.difficultyButtonTextActive
                  ]}>Medium</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    gameDifficulty === 'Hard' && styles.difficultyButtonActive
                  ]}
                  onPress={() => setGameDifficulty('Hard')}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    gameDifficulty === 'Hard' && styles.difficultyButtonTextActive
                  ]}>Hard</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.durationButtons}>
                <TouchableOpacity
                  style={[
                    styles.durationButton,
                    gameDuration === '5-10 min' && styles.durationButtonActive
                  ]}
                  onPress={() => setGameDuration('5-10 min')}
                >
                  <Text style={[
                    styles.durationButtonText,
                    gameDuration === '5-10 min' && styles.durationButtonTextActive
                  ]}>5-10 min</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.durationButton,
                    gameDuration === '10-15 min' && styles.durationButtonActive
                  ]}
                  onPress={() => setGameDuration('10-15 min')}
                >
                  <Text style={[
                    styles.durationButtonText,
                    gameDuration === '10-15 min' && styles.durationButtonTextActive
                  ]}>10-15 min</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.durationButton,
                    gameDuration === '15-20 min' && styles.durationButtonActive
                  ]}
                  onPress={() => setGameDuration('15-20 min')}
                >
                  <Text style={[
                    styles.durationButtonText,
                    gameDuration === '15-20 min' && styles.durationButtonTextActive
                  ]}>15-20 min</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddGame}
            >
              <Text style={styles.submitButtonText}>Create Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  gamesContainer: {
    padding: 20,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  gameInfo: {
    marginLeft: 15,
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  gameMetaContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  gameMeta: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  managementInfo: {
    flex: 1,
    marginLeft: 15,
  },
  managementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  managementDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  managementButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
  },
  managementButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientSelector: {
    padding: 20,
    paddingTop: 0,
  },
  selectorLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  patientButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patientButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  patientButtonActive: {
    backgroundColor: '#4A90E2',
  },
  patientButtonText: {
    color: '#666',
    fontSize: 14,
  },
  patientButtonTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  difficultyButtonActive: {
    backgroundColor: '#4A90E2',
  },
  difficultyButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  difficultyButtonTextActive: {
    color: '#fff',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  durationButtonActive: {
    backgroundColor: '#4A90E2',
  },
  durationButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Game playing styles
  gameContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
  gameStats: {
    flexDirection: 'row',
  },
  gameStatText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  gameInstructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  card: {
    width: 70,
    height: 70,
    backgroundColor: '#4A90E2',
    margin: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFlipped: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  cardText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  gameOverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  gameOverScore: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gameOverMoves: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  playAgainButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Word puzzle styles
  puzzleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scrambledWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    letterSpacing: 5,
    marginBottom: 30,
  },
  puzzleInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    width: '80%',
    textAlign: 'center',
    marginBottom: 20,
  },
  checkButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  checkButtonDisabled: {
    backgroundColor: '#a0c8f0',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackMessage: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  correctMessage: {
    color: '#50C878',
  },
  incorrectMessage: {
    color: '#FF6B6B',
  },
  // Pattern game styles
  patternContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  sequenceContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  sequenceItem: {
    width: 50,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  sequenceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionButton: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#4A90E2',
  },
  optionButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
});
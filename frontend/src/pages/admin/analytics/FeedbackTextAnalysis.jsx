import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, PointElement, LinearScale } from "chart.js";
import { Bubble } from "react-chartjs-2";
import { FaComment, FaChartPie, FaStar, FaSearch } from "react-icons/fa";
import nlp from 'compromise';
import 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, PointElement, LinearScale);
Chart.register(ChartDataLabels);

const TextualFeedbackAnalysis = () => {
  const [selectedRating, setSelectedRating] = useState(5);
  const [topicData, setTopicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedComments, setSelectedComments] = useState([]);
  const [rawFeedback, setRawFeedback] = useState([]);

  // Fetch raw feedback data when rating changes
  useEffect(() => {
    fetchFeedbackData(selectedRating);
  }, [selectedRating]);

  // Process feedback data with topic modeling when raw data changes
  useEffect(() => {
    if (rawFeedback.length > 0) {
      const processedTopics = processTopicModeling(rawFeedback);
      setTopicData(processedTopics);
      setSelectedTopic(null);
      setSelectedComments([]);
      setLoading(false);
    }
  }, [rawFeedback]);

  // Fetch feedback data from API
  const fetchFeedbackData = async (rating) => {
    setLoading(true);
    try {
      // For demo purposes, use simulated data
      setTimeout(() => {
        const mockData = getMockFeedbackData(rating);
        setRawFeedback(mockData);
      }, 500);
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      setLoading(false);
    }
  };

  // Extract hospital-specific terms from feedback corpus
  const extractHospitalTerms = (feedbackData) => {
    // Combine all feedback text into a corpus
    const allText = feedbackData.map(item => item.comments).join(' ');
    
    // Extract potential healthcare terms using healthcare-specific patterns
    const doc = nlp(allText);
    
    // Extract healthcare-specific noun phrases
    const medicalTerms = [];
    
    // 1. Department and service area mentions
    const departments = doc.match('(emergency|radiology|cardiology|oncology|pediatric|surgery|laboratory|billing|reception|waiting) (room|area|department|ward|unit|center|office|desk)').out('array');
    medicalTerms.push(...departments);
    
    // 2. Healthcare staff mentions
    const staff = doc.match('(doctor|physician|nurse|specialist|surgeon|receptionist|technician|staff|practitioner)').out('array');
    medicalTerms.push(...staff);
    
    // 3. Healthcare-specific processes
    const processes = doc.match('(appointment|wait time|check-in|registration|discharge|admission|scheduling|procedure|treatment|examination|checkup|consultation|follow-up|test|scan)').out('array');
    medicalTerms.push(...processes);
    
    // 4. Extract bigrams (potentially capturing new healthcare terms)
    const words = allText.toLowerCase().split(/\s+/);
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i].length > 2 && words[i+1].length > 2) {
        bigrams.push(`${words[i]} ${words[i+1]}`);
      }
    }
    
    // Count all potential terms
    const termCounts = {};
    [...medicalTerms, ...bigrams].forEach(term => {
      const normalized = term.toLowerCase();
      termCounts[normalized] = (termCounts[normalized] || 0) + 1;
    });
    
    // Filter out infrequent terms and score by significance
    const significantTerms = Object.entries(termCounts)
      .filter(([term, count]) => count >= 3) // Term appears at least 3 times
      .map(([term, count]) => {
        // Calculate term significance by comparing frequency across rating groups
        let distinctiveness = 0;
        
        // Group feedback by rating
        const ratingGroups = {};
        feedbackData.forEach(item => {
          if (!ratingGroups[item.rating]) ratingGroups[item.rating] = [];
          ratingGroups[item.rating].push(item.comments);
        });
        
        // Calculate frequency in each rating group
        const ratingFreqs = {};
        Object.entries(ratingGroups).forEach(([rating, texts]) => {
          const combined = texts.join(' ').toLowerCase();
          const regex = new RegExp(`\\b${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
          const matches = combined.match(regex) || [];
          ratingFreqs[rating] = matches.length / texts.length; // Normalized by group size
        });
        
        // Calculate variance between ratings (indicates terms that distinguish ratings)
        const values = Object.values(ratingFreqs);
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        
        distinctiveness = variance * 10; // Scale up for easier comparison
        
        return {
          term,
          count,
          distinctiveness,
          score: count * (1 + distinctiveness) // Combine frequency and distinctiveness
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 50) // Top 50 terms
      .map(item => item.term);
    
    return significantTerms;
  };

  // Extract quality descriptors specific to hospital feedback
  const extractHospitalQualityDescriptors = (feedbackData) => {
    const allText = feedbackData.map(item => item.comments).join(' ');
    const doc = nlp(allText);
    
    // Extract quality-related adjectives in healthcare context
    const qualityPhrases = [];
    
    // 1. Adjectives describing healthcare terms
    const healthcareAdjectivePatterns = [
      // Staff descriptors
      '(friendly|rude|helpful|professional|knowledgeable|competent|efficient|attentive) (staff|doctor|nurse|receptionist|physician)',
      // Facility descriptors
      '(clean|dirty|modern|outdated|comfortable|uncomfortable) (room|facility|hospital|clinic|waiting area|equipment)',
      // Service descriptors
      '(excellent|poor|good|bad|great|terrible|amazing|horrible) (service|care|treatment|experience|communication)',
      // Time descriptors
      '(long|short|quick|slow|excessive|reasonable) (wait|time|delay|appointment)'
    ];
    
    healthcareAdjectivePatterns.forEach(pattern => {
      const matches = doc.match(pattern).out('array');
      qualityPhrases.push(...matches);
    });
    
    // 2. Extract general sentiment adjectives
    const sentimentAdjectives = doc.adjectives()
      .if('#Comparable') // Comparative adjectives often indicate quality
      .out('array');
    
    // 3. Find adjectives in the context of common satisfaction patterns
    const satisfactionPatterns = [
      'was #Adverb? #Adjective',
      'felt #Adverb? #Adjective',
      'seemed #Adverb? #Adjective',
      'very #Adjective',
      'really #Adjective',
      'extremely #Adjective',
      'quite #Adjective'
    ];
    
    const contextualAdjectives = [];
    satisfactionPatterns.forEach(pattern => {
      const matches = doc.match(pattern).out('array');
      // Extract just the adjective from each match
      matches.forEach(match => {
        const parts = match.split(' ');
        const lastWord = parts[parts.length - 1];
        if (lastWord.length > 2) {
          contextualAdjectives.push(lastWord);
        }
      });
    });
    
    // Count and score all descriptors
    const descriptorCounts = {};
    [...qualityPhrases, ...sentimentAdjectives, ...contextualAdjectives].forEach(phrase => {
      const normalized = phrase.toLowerCase();
      descriptorCounts[normalized] = (descriptorCounts[normalized] || 0) + 1;
    });
    
    // Select most frequent descriptors
    const descriptorScores = Object.entries(descriptorCounts)
      .filter(([term, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(item => item[0]);
    
    return descriptorScores;
  };

  // Discover relationships between hospital terms
  const discoverHospitalTermRelationships = (feedbackData, hospitalTerms) => {
    const relationships = {};
    
    // Co-occurrence analysis
    hospitalTerms.forEach(term => {
      // Find feedback containing this term
      const relatedFeedback = feedbackData.filter(item => 
        item.comments.toLowerCase().includes(term)
      );
      
      if (relatedFeedback.length < 3) {
        relationships[term] = [];
        return;
      }
      
      // Find co-occurring hospital terms
      const coOccurrences = {};
      hospitalTerms.forEach(otherTerm => {
        if (term !== otherTerm) {
          const count = relatedFeedback.filter(item => 
            item.comments.toLowerCase().includes(otherTerm)
          ).length;
          
          if (count > 0) {
            // Calculate simple co-occurrence score
            coOccurrences[otherTerm] = count / relatedFeedback.length;
          }
        }
      });
      
      // Enhance with syntactic relationships (terms appearing in same sentence)
      const allText = relatedFeedback.map(item => item.comments).join('. ');
      const doc = nlp(allText);
      const sentences = doc.sentences().out('array');
      
      hospitalTerms.forEach(otherTerm => {
        if (term !== otherTerm && !coOccurrences[otherTerm]) {
          // Count sentences containing both terms
          const sentencesWithBothTerms = sentences.filter(sentence => 
            sentence.toLowerCase().includes(term) && 
            sentence.toLowerCase().includes(otherTerm)
          ).length;
          
          if (sentencesWithBothTerms > 0) {
            coOccurrences[otherTerm] = sentencesWithBothTerms / sentences.length;
          }
        }
      });
      
      // Select top related terms
      relationships[term] = Object.entries(coOccurrences)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([relatedTerm]) => relatedTerm);
    });
    
    return relationships;
  };

  // Extract meaningful noun phrases from text
  const extractNounPhrases = (text, hospitalTerms) => {
    const doc = nlp(text);
    
    // Get noun phrases (with optional adjectives and determiners)
    const nounPhrases = doc.match('#Determiner? #Adjective* #Noun+').out('array');
    
    // Get subject-verb-object patterns that often contain key feedback
    const svoPatterns = doc.clauses().out('array');
    
    // Common stopwords to filter out
    const stopwords = [
      'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her'
    ];
    
    // Combine and filter meaningful phrases
    const phrases = [...nounPhrases, ...svoPatterns]
      .filter(phrase => {
        // Only keep phrases of reasonable length
        const wordCount = phrase.split(' ').length;
        const charLength = phrase.length;
        
        // Prioritize phrases that contain hospital terms
        const containsHospitalTerm = hospitalTerms.some(term => 
          phrase.toLowerCase().includes(term)
        );
        
        // Basic filtering criteria
        return charLength > 4 && wordCount <= 4 && 
              !stopwords.includes(phrase.split(' ')[0].toLowerCase()) &&
              !stopwords.includes(phrase.split(' ')[wordCount-1].toLowerCase());
      })
      .map(phrase => phrase.toLowerCase());
    
    return phrases;
  };

  // Extract key terms using hospital-specific context
  const extractKeyTerms = (text, hospitalTerms, qualityDescriptors) => {
    const lowercaseText = text.toLowerCase();
    
    // 1. Extract hospital terms that appear in the text
    const matchedHospitalTerms = hospitalTerms.filter(term => 
      lowercaseText.includes(term)
    );
    
    // 2. Extract quality descriptors in hospital context
    const qualityPhrases = [];
    for (const descriptor of qualityDescriptors) {
      for (const term of hospitalTerms) {
        // Check for patterns like "excellent staff" or "staff was excellent"
        if (lowercaseText.includes(`${descriptor} ${term}`) || 
            lowercaseText.includes(`${term} ${descriptor}`) ||
            lowercaseText.includes(`${term} was ${descriptor}`) ||
            lowercaseText.includes(`${term} were ${descriptor}`)) {
          qualityPhrases.push(`${descriptor} ${term}`);
        }
      }
    }
    
    // 3. Extract specific patterns using compromise
    const doc = nlp(text);
    const patternPhrases = [];
    
    // Patterns for healthcare-specific phrases
    const healthcarePatterns = [
      // Wait time patterns
      '(long|short|excessive|reasonable) wait time',
      // Staff behavior
      '(friendly|rude|helpful|unhelpful) staff',
      // Quality of care
      '(excellent|poor|good|bad) (care|service|treatment)',
      // Specific issues
      '(billing|insurance|medication|appointment) (issue|problem|error)'
    ];
    
    healthcarePatterns.forEach(pattern => {
      const matches = doc.match(pattern).out('array');
      patternPhrases.push(...matches);
    });
    
    return [...new Set([...matchedHospitalTerms, ...qualityPhrases, ...patternPhrases])];
  };

  // Calculate TF-IDF scores with domain knowledge boost
  const calculateTfIdf = (documentPhrases, feedbackData, hospitalTerms, qualityDescriptors) => {
    const phraseTfidf = {};
    const phraseDocCounts = {};
    
    // Calculate document frequency for each phrase
    Object.values(documentPhrases).forEach(phrases => {
      const uniquePhrases = [...new Set(phrases)];
      uniquePhrases.forEach(phrase => {
        phraseDocCounts[phrase] = (phraseDocCounts[phrase] || 0) + 1;
      });
    });
    
    // Calculate TF-IDF with domain boosts
    Object.entries(documentPhrases).forEach(([docId, phrases]) => {
      // Count phrase frequency in this document
      const phraseCounts = {};
      phrases.forEach(phrase => {
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
      });
      
      // Calculate TF-IDF with boosts
      Object.entries(phraseCounts).forEach(([phrase, count]) => {
        // Term frequency in this document
        const tf = count;
        
        // Inverse document frequency
        const idf = Math.log(feedbackData.length / (phraseDocCounts[phrase] || 1));
        
        // Base TF-IDF score
        let score = tf * idf;
        
        // Apply domain knowledge boosts
        const containsHospitalTerm = hospitalTerms.some(term => phrase.includes(term));
        const containsQualityDescriptor = qualityDescriptors.some(term => phrase.includes(term));
        
        if (containsHospitalTerm) score *= 1.5;
        if (containsQualityDescriptor) score *= 1.3;
        if (phrase.split(' ').length > 1) score *= 1.2; // Boost multi-word phrases
        
        // Penalize very short phrases
        if (phrase.length < 5) score *= 0.8;
        
        // Store score
        if (!phraseTfidf[phrase]) phraseTfidf[phrase] = { score: 0, docs: [] };
        phraseTfidf[phrase].score += score;
        phraseTfidf[phrase].docs.push(docId);
      });
    });
    
    return phraseTfidf;
  };

  // Group similar phrases to reduce redundancy
  const groupSimilarPhrases = (phraseTfidf, termRelationships) => {
    const phraseGroups = [];
    const processedPhrases = new Set();
    
    // Sort phrases by score for better grouping
    const sortedPhrases = Object.entries(phraseTfidf)
      .sort((a, b) => b[1].score - a[1].score);
    
    for (const [phrase, data] of sortedPhrases) {
      if (processedPhrases.has(phrase)) continue;
      
      // Skip phrases with very low scores
      if (data.score < 0.1) continue;
      
      // Start a new group with this phrase
      const group = {
        mainPhrase: phrase,
        phrases: [phrase],
        score: data.score,
        docs: new Set(data.docs)
      };
      processedPhrases.add(phrase);
      
      // Find similar phrases to group together
      for (const [otherPhrase, otherData] of sortedPhrases) {
        if (processedPhrases.has(otherPhrase)) continue;
        
        if (areSemanticallyRelated(phrase, otherPhrase, termRelationships)) {
          group.phrases.push(otherPhrase);
          group.score += otherData.score * 0.7; // Reduce weight for similar phrases
          otherData.docs.forEach(doc => group.docs.add(doc));
          processedPhrases.add(otherPhrase);
        }
      }
      
      phraseGroups.push(group);
    }
    
    return phraseGroups;
  };

  // Check if two phrases are semantically related
  const areSemanticallyRelated = (phrase1, phrase2, termRelationships) => {
    // Common stopwords for filtering
    const stopwords = [
      'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ];
    
    // Simple word overlap
    const words1 = phrase1.split(' ');
    const words2 = phrase2.split(' ');
    
    // Check for shared words
    const sharedWords = words1.filter(word => 
      words2.includes(word) && word.length > 3 && !stopwords.includes(word)
    );
    
    // Check if phrases share significant words
    if (sharedWords.length >= 1) return true;
    
    // Check if one phrase is contained within the other
    if (phrase1.includes(phrase2) || phrase2.includes(phrase1)) return true;
    
    // Check for related terms using the discovered relationships
    for (const term in termRelationships) {
      if (phrase1.includes(term)) {
        const relatedTerms = termRelationships[term];
        if (relatedTerms.some(relatedTerm => phrase2.includes(relatedTerm))) {
          return true;
        }
      }
      
      if (phrase2.includes(term)) {
        const relatedTerms = termRelationships[term];
        if (relatedTerms.some(relatedTerm => phrase1.includes(relatedTerm))) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Create final topic data structure from phrase groups
  const createTopicPhrases = (phraseGroups, feedbackData) => {
    // Sort groups by combined score
    const sortedGroups = phraseGroups
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Take top 10 groups
    
    // Create topic data structure
    return sortedGroups.map(group => {
      // Find the most representative phrase (prefer 2-3 word phrases)
      const mainPhrase = findBestPhrase(group.phrases);
      
      // Find related comments
      const docIndices = Array.from(group.docs).map(idx => parseInt(idx));
      const relatedComments = docIndices.map(idx => feedbackData[idx])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return {
        phrase: mainPhrase,
        keyphrases: group.phrases.slice(0, 10), // Store related phrases
        count: relatedComments.length,
        recentComments: relatedComments.slice(0, 5).map(comment => ({
          text: comment.comments,
          created_at: comment.created_at,
          rating: comment.rating
        }))
      };
    });
  };

  // Find the best representative phrase from a group
  const findBestPhrase = (phrases) => {
    // Prioritize 2-3 word phrases
    const multiWordPhrases = phrases.filter(p => {
      const wordCount = p.split(' ').length;
      return wordCount >= 2 && wordCount <= 3;
    });
    
    if (multiWordPhrases.length > 0) {
      return multiWordPhrases[0];
    }
    
    // Fall back to the first phrase
    return phrases[0];
  };

  // Process feedback data with topic modeling
  const processTopicModeling = (feedbackData) => {
    console.log("Analyzing hospital feedback patterns...");

    // Step 1: Extract hospital-specific terms and quality descriptors
    const hospitalTerms = extractHospitalTerms(feedbackData);
    const qualityDescriptors = extractHospitalQualityDescriptors(feedbackData);
    
    // Step 2: Discover relationships between hospital terms
    const termRelationships = discoverHospitalTermRelationships(feedbackData, hospitalTerms);
    
    // Step 3: Extract phrases from each document
    const documentPhrases = {};
    feedbackData.forEach((feedback, idx) => {
      // Extract both noun phrases and key terms using the discovered lists
      const nounPhrases = extractNounPhrases(feedback.comments, hospitalTerms);
      const keyTerms = extractKeyTerms(feedback.comments, hospitalTerms, qualityDescriptors);
      
      // Combine unique phrases
      const uniquePhrases = [...new Set([...nounPhrases, ...keyTerms])];
      documentPhrases[idx] = uniquePhrases;
    });
    
    // Step 4: Calculate TF-IDF with domain knowledge
    const phraseTfidf = calculateTfIdf(documentPhrases, feedbackData, hospitalTerms, qualityDescriptors);
    
    // Step 5: Group similar phrases
    const phraseGroups = groupSimilarPhrases(phraseTfidf, termRelationships);
    
    // Step 6: Create topic data from phrase groups
    const topicPhrases = createTopicPhrases(phraseGroups, feedbackData);
    
    return topicPhrases;
  };

  // Handle bubble click to display comments
  const handleBubbleClick = (_, elements) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const selectedTopicData = topicData[index];
      setSelectedTopic(selectedTopicData.phrase);
      setSelectedComments(selectedTopicData.recentComments);
    }
  };

  // Prepare bubble chart data
  const prepareBubbleChartData = () => {
    // Create a more distributed layout
    const xPositions = [];
    const yPositions = [];
    
    // Position bubbles in a grid-like pattern
    const columns = Math.ceil(Math.sqrt(topicData.length));
    const xStep = 1000 / columns;
    const yStep = 500 / columns;
    
    topicData.forEach((_, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      xPositions.push(col * xStep + (Math.random() * 100) - 50);
      yPositions.push(row * yStep + (Math.random() * 100) - 50);
    });
    
    return {
      datasets: [
        {
          label: `Topics for Rating ${selectedRating}`,
          data: topicData.map((topic, index) => ({
            x: xPositions[index],
            y: yPositions[index],
            r: topic.count > 50 ? 50 : Math.max(10, topic.count),
            topic: topic.phrase,
            count: topic.count,
            keyphrases: topic.keyphrases
          })),
          backgroundColor: topicData.map((_, i) =>
            `rgba(${Math.floor(Math.random() * 200) + 55}, ${Math.floor(Math.random() * 200) + 55}, ${Math.floor(Math.random() * 200) + 55}, 0.7)`
          ),
          borderWidth: 1,
          borderColor: "rgba(0, 0, 0, 0.2)",
        },
      ],
    };
  };

  // Bubble chart options
  const bubbleOptions = {
    scales: {
      x: {
        display: false,
        min: -200,
        max: 1000,
      },
      y: {
        display: false,
        min: -200,
        max: 450,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const data = context.raw;
            const topPhrases = data.keyphrases?.slice(0, 3).join(', ') || '';
            if (topPhrases) {
              return [
                `${data.topic}: ${data.count} occurrences`,
                `Related: ${topPhrases}`
              ];
            }
            return `${data.topic}: ${data.count} occurrences`;
          },
        },
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: function(context) {
          return context.dataset.data[context.dataIndex].r > 20;
        },
        color: '#fff',
        font: {
          weight: 'bold',
        },
        formatter: (value) => {
          return value.topic;
        }
      }
    },
    responsive: true,
    onClick: handleBubbleClick,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const highlightKeyPhrase = (comment, phrase) => {
    if (!phrase) return comment;
    
    // Create a case-insensitive regular expression from the phrase
    const regex = new RegExp(`(${phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    
    // Split the comment by the regex matches
    const parts = comment.split(regex);
    
    // Return the comment with highlighted phrase
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-yellow-200 font-semibold">{part}</span> : part
    );
  };

  return (
    <div className="flex flex-col w-full p-6 bg-gray-50 min-h-screen">
      <h1 className="flex items-center text-3xl font-bold text-gray-800 mb-6">
        <FaComment className="mr-3 text-blue-500" />
        Textual Feedback Analysis
      </h1>

      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaChartPie className="mr-2 text-blue-500" />
            Patient Feedback Topic Analysis
          </h2>
          <p className="text-gray-600 mb-6">
            Select a rating to see the most frequent topics.
          </p>

          {/* Rating selector */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-gray-700 font-medium">Select Rating:</span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${
                    selectedRating === rating
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex items-center text-gray-500 ml-4">
              <FaStar className="text-yellow-400 mr-1" />
              <span>{selectedRating}/5 rating feedback analysis</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Bubble Chart */}
              <div className="h-96 mb-6 relative">
                {topicData.length > 0 ? (
                  <>
                    <div className="absolute top-0 left-0 text-gray-500 text-sm mb-2">
                      <span className="font-medium">Note:</span> Bubble size represents frequency. Click on a bubble to see related key phrases and related comments.
                    </div>
                    <Bubble data={prepareBubbleChartData()} options={bubbleOptions} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FaSearch className="text-4xl mb-4 text-gray-300" />
                    <p>No feedback data available for this rating</p>
                  </div>
                )}
              </div>

              {/* Topic Key Phrases Section */}
              {selectedTopic && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-medium text-blue-800 mb-3 flex items-center">
                    Key phrases related to "{selectedTopic}"
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {topicData.find(t => t.phrase === selectedTopic)?.keyphrases.slice(0, 10).map((phrase) => (
                      <span 
                        key={phrase} 
                        className="px-3 py-1 bg-white rounded-full text-sm font-medium text-blue-700 border border-blue-200 shadow-sm"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Topic Comments */}
              {selectedTopic && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Recent comments mentioning "{selectedTopic}"
                  </h3>
                  <div className="space-y-3">
                    {selectedComments.length > 0 ? (
                      selectedComments.map((comment, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-md shadow-sm"
                        >
                          <div className="text-gray-800">
                            {highlightKeyPhrase(comment.text, selectedTopic)}
                          </div>
                          <div className="mt-2 text-sm text-gray-500 flex justify-between">
                            <div>{formatDate(comment.created_at)}</div>
                            <div className="flex items-center">
                              <span className="flex items-center">
                                <FaStar className="text-yellow-400 mr-1" />
                                {comment.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No recent comments available</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data generation function
const getMockFeedbackData = (rating) => {
  const now = new Date();
  
  // Complete feedback templates for all ratings
  const feedbackTemplates = {
    1: [
      "The wait time was incredibly long, waited over {time} hours just to see a doctor.",
      "Rude staff at the {location}. They didn't even acknowledge me when I was talking to them.",
      "I have serious billing issues with this hospital. They charged me {problem} for the same procedure!",
      "Poor communication between departments. Nobody knew what was happening with my case.",
      "I was given incorrect medication which caused me {issue}. Completely unprofessional.",
      "The hospital rooms were in unsanitary conditions. Found {dirt} everywhere.",
      "Had so many appointment problems. They cancelled {count} times without proper notification.",
      "Spent over {time} hours waiting. The wait time is ridiculous. Will never come back again.",
      "The billing issues I've had with this hospital are endless. They don't know how to process insurance properly.",
      "Rude {staff} at every level. From reception to nurses, everyone seemed annoyed by patients."
    ],
    2: [
      "Wait time was too long, but at least the doctor was knowledgeable.",
      "Some staff were nice, but others were quite unhelpful when I asked for {request}.",
      "Found billing errors on my statement. Had to call {count} times to get it fixed.",
      "Poor facilities with outdated equipment. Expected better for what they charge.",
      "Had some medication issues. {staff} didn't explain how to take it properly.",
      "Received unclear instructions about my follow-up care. Had to figure it out myself.",
      "The wait time of {time} hours seems excessive for a scheduled appointment.",
      "Bathroom facilities were poor, and the waiting area was uncomfortable.",
      "While the doctor was okay, the unhelpful staff at reception made the experience negative.",
      "Had billing errors that took weeks to resolve. Their financial department is a mess."
    ],
    3: [
      "Just average service overall. Nothing special but nothing terrible either.",
      "Wait time was reasonable but could be improved. Waited about {time} minutes past my appointment.",
      "Nurses were friendly but the doctors seemed rushed during my {visit}.",
      "Had some minor billing issues but they were resolved quickly.",
      "The doctors were good but the administrative process was confusing.",
      "Facilities were clean but outdated. Could use some modernization.",
      "Had some parking problems. Limited spaces available for patients.",
      "The waiting room was comfortable, but the wait time was longer than expected.",
      "Average service, friendly nurses but the doctor seemed distracted during our consultation.",
      "The hospital was clean overall, but there were billing issues with my insurance coverage."
    ],
    4: [
      "Very friendly {staff}, made me feel comfortable throughout my visit.",
      "The doctors were professional and knowledgeable. Explained my {condition} clearly.",
      "Clean facilities, well maintained. Felt safe and comfortable during my stay.",
      "Good communication between staff and with patients. Kept me informed about my treatment.",
      "Reasonable wait time, much better than other hospitals I've been to.",
      "Had some minor billing issues but they were resolved promptly and professionally.",
      "The friendly staff made a stressful situation much easier to handle.",
      "Professional doctors who took the time to address all my concerns about my health.",
      "The facilities were clean and modern. Good environment for healing.",
      "Good experience overall. Reasonable wait time and attentive care from the medical team."
    ],
    5: [
      "Received excellent care from start to finish. Couldn't ask for better service.",
      "The {staff} was incredibly friendly and supportive throughout my {duration} stay.",
      "Professional doctors who really took the time to explain everything about my {condition} to me.",
      "The hospital was immaculately clean. Very impressive facilities and equipment.",
      "Almost no wait time. Was seen immediately upon arrival by Dr. {doctor}.",
      "Clear communication at every step. Knew exactly what was happening with my treatment.",
      "Efficient service from all departments. Very well coordinated care between specialists.",
      "The short wait time was impressive. Was seen right at my appointment time.",
      "Excellent care from the nursing staff. They were attentive and compassionate during my recovery.",
      "Professional doctors with excellent bedside manner. They made me feel at ease throughout the procedure."
    ]
  };
  
  // Variables to randomize in templates
  const variables = {
    time: ['2', '3', '4', '5'],
    location: ['reception desk', 'emergency room', 'waiting area', 'front desk'],
    problem: ['twice', 'three times', 'for services I never received', 'incorrectly'],
    issue: ['serious side effects', 'an allergic reaction', 'nausea', 'dizziness'],
    dirt: ['hair', 'dust', 'stains', 'trash'],
    count: ['twice', 'three times', 'multiple times', 'repeatedly'],
    staff: ['nurses', 'receptionists', 'doctors', 'staff members'],
    request: ['directions', 'assistance', 'information', 'help with forms'],
    visit: ['checkup', 'appointment', 'consultation', 'examination'],
    condition: ['diagnosis', 'treatment plan', 'medication regimen', 'test results'],
    duration: ['two-day', 'week-long', 'short', 'overnight'],
    doctor: ['Smith', 'Johnson', 'Williams', 'Brown', 'Miller']
  };
  
  // Replace variables in templates
  function replaceVariables(template) {
    let result = template;
    
    Object.keys(variables).forEach(key => {
      const pattern = new RegExp(`\\{${key}\\}`, 'g');
      const options = variables[key];
      const replacement = options[Math.floor(Math.random() * options.length)];
      result = result.replace(pattern, replacement);
    });
    
    return result;
  }
  
  // Generate feedback data
  const mockData = [];
  
  // Create a realistic number of feedback entries with better distribution
  const count = rating === 5 ? 120 : rating === 4 ? 100 : rating === 3 ? 80 : rating === 2 ? 60 : 80;
  
  for (let i = 0; i < count; i++) {
    const templates = feedbackTemplates[rating] || feedbackTemplates[5];
    
    // Select base template
    const templateIndex = Math.floor(Math.random() * templates.length);
    const baseTemplate = templates[templateIndex];
    
    // Process template with variable replacement
    let comment = replaceVariables(baseTemplate);
    
    // Sometimes combine two templates for more complex feedback (20% chance)
    if (Math.random() < 0.2 && templates.length > 1) {
      const secondTemplateIndex = (templateIndex + 1 + Math.floor(Math.random() * (templates.length - 1))) % templates.length;
      const secondTemplate = templates[secondTemplateIndex];
      const secondComment = replaceVariables(secondTemplate);
      comment = `${comment} ${secondComment}`;
    }
    
    // Add occasional specific details (30% chance)
    if (Math.random() < 0.3) {
      const details = [
        "This happened on my visit last week.",
        "I visited for a routine checkup.",
        "I was there for my annual physical.",
        "This was during my emergency visit.",
        "I experienced this during my follow-up appointment.",
        "This happened when I came in for lab tests."
      ];
      const detailIndex = Math.floor(Math.random() * details.length);
      comment = `${comment} ${details[detailIndex]}`;
    }
    
    // Create more realistic date distribution (weighted toward recent)
    let daysAgo;
    const rand = Math.random();
    if (rand < 0.4) {
      // 40% of feedback within last month
      daysAgo = Math.floor(Math.random() * 30);
    } else if (rand < 0.7) {
      // 30% within 1-3 months
      daysAgo = 30 + Math.floor(Math.random() * 60);
    } else {
      // 30% within 3-6 months
      daysAgo = 90 + Math.floor(Math.random() * 90);
    }
    
    const randomDate = new Date(now);
    randomDate.setDate(randomDate.getDate() - daysAgo);
    
    mockData.push({
      feedback_id: i + 1,
      consult_id: Math.floor(Math.random() * 1000) + 1,
      doctor_id: Math.floor(Math.random() * 20) + 1,
      rating: rating,
      comments: comment,
      created_at: randomDate.toISOString()
    });
  }
  
  return mockData;
};

export default TextualFeedbackAnalysis;

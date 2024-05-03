var jsPsychSurveyTextHighlight = (function (jspsych) {
  'use strict';

  var nonEmptyWords = [];
  var audioPlaying = false;
  var audio;

  const info = {
    name: "survey-text",
    parameters: {
      /** HTML-formatted string to display at top of the page above all of the questions. */
      instructions: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Preamble",
        default: null,
      },
      /** HTML-formatted string to display at top of the page above all of the questions. */
      title: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Title",
        default: null,
      },
      /** HTML-formatted string to display at top of the page above all of the questions. */
      video_transcript: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Video Transcript",
        default: null,
      },
      button_label: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Button label",
        default: "Submit",
      },
      object: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "object",
        default: null,
      }
    },
  };
  /**
   * **survey-text**
   *
   * jsPsych plugin for free text response survey questions
   *
   * @author Josh de Leeuw
   * @see {@link https://www.jspsych.org/plugins/jspsych-survey-text/ survey-text plugin documentation on jspsych.org}
   */
  class SurveyTextPlugin {

    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      var html = "";

      if (trial.instructions !== null) {
        html +=
          '<div id="trial_display">'

        if (trial.trialType == 'test') {
          html +=
            '<div id="trialNum"> ' + "Transcript: " + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
        } else {
          html +=
            '<div id="trialNum" style="color: white !important"> ' + "Transcript: " + (trial.trialNum + 1) + " / " + trial.numTrials + '</div>';
        }
        html +=
          '<p id="instructions">' + trial.instructions + '</p>'

        html +=
          '<p id="title">' + trial.title + '</p>'

        html +=
          '<div id="wordCount"> ' + "Word count: " + (nonEmptyWords.length) + " / 20" + '</div>';

        html +=
          '<div>' +
          '<button id="execute" class="jspsych-btn jspsych-survey-text buttons">' +
          '<b>Highlighter</b>' +
          '<img class=icons src="../stim/highlighter_yellow.png" alt="Image">' +
          '</button>' +
          '<button id="undoHighlight" class="jspsych-btn jspsych-survey-text buttons">' +
          '<b>Undo</b>' +
          '<img class=icons src="../stim/eraser_blue.png" alt="Image">' +
          '</button>' +
          '<button id="eraseHighlight" class="jspsych-btn jspsych-survey-text buttons">' +
          '<b>Clear all</b>' +
          '<img class=icons src="../stim/eraser_blue.png" alt="Image">' +
          '</button>'
        '</div>';

        html +=
          '<div id="content">' +
          '<p id="textParagraph"></p>' +
          '<p id="newText"></p>' +
          '</div>'
      }


      if (trial.button_label !== null) {
        // html += '<button id="nextButton" class="jspsych-btn jspsych-survey-text">Next Paragraph</button>'
        html += '<input type="submit" id="submit-button" class="jspsych-btn jspsych-survey-text" value="' +
          trial.button_label +
          '"></input>'
      }

      html += '</div>' // close trial_display

      display_element.innerHTML = html;

      // Initialize data structures and variables
      var wordDictionary = {};
      var selectedWords = {};
      var highlights = [];
      var highlightCounter = 0;
      var currentAudio = null;

      // Function to create an image element
      function createImageElement(src) {
        var imgContainer = document.createElement("div");
        imgContainer.classList.add("image-container");

        var img = document.createElement("img");
        img.src = src;
        img.style.width = "40px";
        img.style.height = "40px";

        imgContainer.appendChild(img);
        return imgContainer;
      }

      var textParagraph = document.getElementById("textParagraph");
      textParagraph.innerHTML = ""; // Clear the existing content

      trial.video_transcript.forEach((paragraph, index) => {
        var paragraphContainer = document.createElement("div");
        paragraphContainer.classList.add("paragraph-container");

        // Add image to the left of the paragraph
        var imagePath = "../stim/microphone" + ".png";
        var img = createImageElement(imagePath);
        paragraphContainer.appendChild(img);

        // Add paragraph text to the right
        var paragraphText = document.createElement("p");
        paragraphText.innerHTML = paragraph;
        paragraphContainer.appendChild(paragraphText);
        paragraphText.classList.add("half-opaque");

        // Add click event to the image to play the audio file
        img.addEventListener("click", function () {
          var audioSrc = "../stim/" + trial.object + "_" + index + ".mp3"; // Replace with the actual audio path
          // Create an audio element
          // Stop the currently playing audio, if any
          if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
          }

          // Create a new audio element
          currentAudio = new Audio(audioSrc);

          // Play the audio
          currentAudio.play();
          paragraphText.classList.remove("half-opaque");
          paragraphText.classList.add("full-opaque");
          img.classList.add("half-saturation");
          img.classList.add("half-opaque");
        });

        // Add CSS styles for the hover effect
        img.classList.add("image-container");
        img.style.cursor = "pointer";

        textParagraph.appendChild(paragraphContainer);
      });

      document.getElementById('execute').addEventListener('click', function () {
        // Get the selected range
        var selection = window.getSelection();
        if (selection.isCollapsed) {
          return; // No text selected
        }

        // Get the clicked paragraph
        var clickedParagraph = getClickedParagraph();

        // Check if the clicked paragraph has the "full-opacity" class
        if (clickedParagraph && clickedParagraph.classList.contains('full-opaque')) {
          // Get the selected range
          var selection = window.getSelection();
          if (selection.isCollapsed) {
            return; // No text selected
          }

          var range = selection.getRangeAt(0);
          var span = document.createElement('span');

          // Check if the selection spans across paragraphs
          if (!isSelectionInSameParagraph(range)) {
            alert("Please highlight within the same paragraph.");
            return;
          }

          // Apply the 'highlight' class to the selected range
          span.className = 'highlight';
          span.appendChild(range.extractContents());
          range.insertNode(span);

          // Get the selected text and split it into words
          var selectedText = range.toString();
          var words = selectedText.split(/\s+/);

          var myWords = words.filter(function (word) {
            return word !== "";
          });

          nonEmptyWords = nonEmptyWords.concat(myWords);
          var wordCountDisplay = document.getElementById('wordCount');
          wordCountDisplay.textContent = "Word count: " + nonEmptyWords.length + " / 20";

          // Update the color based on the number of non-empty words
          if (nonEmptyWords.length >= 15 && nonEmptyWords.length <= 20) {
            wordCountDisplay.classList.remove('red');
            wordCountDisplay.classList.add('green');
          } else if (nonEmptyWords.length > 20) {
            wordCountDisplay.classList.remove('green');
            wordCountDisplay.classList.add('red');
          } else {
            // Reset the color if the count is less than 15
            wordCountDisplay.classList.remove('green', 'red');
          }

          // Store the selected words in the dictionary
          selectedWords[highlightCounter] = {};
          for (var i = 0; i < words.length; i++) {
            selectedWords[highlightCounter][i] = words[i];
          }

          // Increment the counter for the next highlight event
          highlightCounter++;

          // Add the newly highlighted span to the highlights array
          highlights.push(span);

          console.log(selectedWords)
        } else {
          alert("Please listen to the corresponding audio clip first! Click the microphone icon to the left of the paragraph you want to add highlights to.");
        }
      });

      function isSelectionInSameParagraph(range) {
        // Get start and end container nodes
        var startContainer = range.startContainer;
        var endContainer = range.endContainer;

        // Check if start and end containers are paragraph elements
        if (startContainer.nodeName === 'P' && endContainer.nodeName === 'P') {
          return true;
        }

        // Check if start and end containers have the same parent paragraph
        if (startContainer.parentElement.nodeName === 'P' && endContainer.parentElement.nodeName === 'P') {
          return true;
        }

        // Selection spans across paragraphs
        return false;
      }

      // Helper function to check if the paragraph has the 'full-opacity' class
      function isParagraphFullOpacity(paragraph) {
        return paragraph.classList.contains('full-opaque');
      }

      // Helper function to get the clicked paragraph
      function getClickedParagraph() {
        var selection = window.getSelection();
        if (selection.anchorNode && selection.anchorNode.parentElement) {
          var clickedElement = getParentParagraph(selection.anchorNode.parentElement);
          if (clickedElement && isParagraphFullOpacity(clickedElement)) {
            return clickedElement;
          }
        }
        return null;
      }

      document.getElementById('undoHighlight').addEventListener('click', function () {
        // Check if there are any highlights to undo
        if (highlightCounter > 0) {

          // Get the last highlighted span
          var lastHighlight = highlights.pop();

          // Decrement the counter for the next highlight event
          highlightCounter--;

          console.log(highlightCounter, 'highlightCounter')


          // Remove the last dictionary entry from "selectedWords"
          delete selectedWords[highlightCounter];

          // Remove the yellow highlight class
          lastHighlight.classList.remove('highlight');

          // Get the text content of the last highlighted span
          var highlightedText = lastHighlight.textContent;

          // Remove the erased words from nonEmptyWords array
          nonEmptyWords = nonEmptyWords.filter(function (word) {
            return !highlightedText.includes(word);
          });

          // Decrement the word count display
          var wordCountDisplay = document.getElementById('wordCount');
          wordCountDisplay.textContent = "Word count: " + nonEmptyWords.length + " / 20";

          // Update the color based on the number of non-empty words
          if (nonEmptyWords.length >= 15 && nonEmptyWords.length <= 20) {
            wordCountDisplay.classList.remove('red');
            wordCountDisplay.classList.add('green');
          } else if (nonEmptyWords.length > 20) {
            wordCountDisplay.classList.remove('green');
            wordCountDisplay.classList.add('red');
          } else {
            // Reset the color if the count is less than 15
            wordCountDisplay.classList.remove('green', 'red');
          }
        } else {
          // No highlights to undo
          alert("No highlights to undo.");
        }
      });

      document.getElementById('eraseHighlight').addEventListener('click', function () {
        // Check if there are any highlights to undo
        if (highlightCounter > 0) {
          // Get all highlighted spans with the 'highlight' class
          var highlightedSpans = document.querySelectorAll('.highlight');

          // Loop through each highlighted span
          highlightedSpans.forEach(function (highlight) {
            // Remove the yellow highlight class
            highlight.classList.remove('highlight');

            // Get the text content of the highlighted span
            var highlightedText = highlight.textContent;

            // Remove the erased words from nonEmptyWords array
            nonEmptyWords = nonEmptyWords.filter(function (word) {
              return !highlightedText.includes(word);
            });

            // Decrement the word count display
            var wordCountDisplay = document.getElementById('wordCount');
            wordCountDisplay.textContent = "Word count: " + nonEmptyWords.length + " / 20";

            // Update the color based on the number of non-empty words
            if (nonEmptyWords.length >= 15 && nonEmptyWords.length <= 20) {
              wordCountDisplay.classList.remove('red');
              wordCountDisplay.classList.add('green');
            } else if (nonEmptyWords.length > 20) {
              wordCountDisplay.classList.remove('green');
              wordCountDisplay.classList.add('red');
            } else {
              // Reset the color if the count is less than 15
              wordCountDisplay.classList.remove('green', 'red');
            }

            // Reset counter
            highlightCounter = 0;

            // Remove the erased words from the selectedWords dictionary
            for (var key in selectedWords) {
              var wordsInHighlight = Object.values(selectedWords[key]);
              for (var k = 0; k < wordsInHighlight.length; k++) {
                if (highlightedText.includes(wordsInHighlight[k])) {
                  delete selectedWords[key];
                  break;
                }
              }
            }
          });
        } else {
          // No highlights to clear
          alert("No highlights to clear.");
        }
      });

      // Helper function to find the highlighted span containing the selected text
      function isSelectionInSameParagraph(range) {
        var startParagraph = getParentParagraph(range.startContainer);
        var endParagraph = getParentParagraph(range.endContainer);

        // Check if start and end paragraphs are the same
        return startParagraph === endParagraph;
      }

      // Helper function to get the parent paragraph of a node
      function getParentParagraph(node) {
        while (node && node.nodeName !== 'P') {
          node = node.parentElement;
        }
        return node;
      }

      display_element.querySelector("#submit-button").addEventListener("click", (e) => {
        e.preventDefault();

        if (nonEmptyWords.length == 0) {
          window.alert("You must highlight at least 15 words before moving onto the next trial.");
        } else if (nonEmptyWords.length < 15) {
          window.alert("You must highlight at least 15 words before moving onto the next trial.");
        } else if (nonEmptyWords.length > 20) {
          window.alert("You cannot highlight more than 20 words. Please erase some words before clicking Submit.");
        } else {
          // measure response time
          var endTime = performance.now();
          var response_time = Math.round(endTime - startTime);

          if (trial.trialType == 'test') {
            // save data
            var trial_data = {
              rt: response_time,
              response: selectedWords,
              gameID: trial.gameID,
              dbname: trial.dbname,
              colname: trial.colname,
              iterationName: trial.iterationName,
              recruitmentPlatform: trial.recruitmentPlatform,
              eventType: 'test',
              goal: trial.goal,
              object: trial.object,
              trialNum: trial.trialNum,
              video_transcript: trial.transcript,
              numTrials: trial.numTrials,
              survey: 'not_survey'
            };
          } else if (trial.trialType == 'practice') {
            // save data
            var trial_data = {
              rt: response_time,
              response: selectedWords,
              gameID: trial.gameID,
              dbname: trial.dbname,
              colname: trial.colname,
              iterationName: trial.iterationName,
              recruitmentPlatform: trial.recruitmentPlatform,
              eventType: 'practice',
              goal: trial.goal,
              object: trial.object,
              trialNum: trial.trialNum,
              video_transcript: trial.video_transcript,
              numTrials: trial.numTrials,
              survey: 'not_survey'
            };
          }

          // send data to mongoDB
          console.log('currentData', trial_data);
          socket.emit('currentData', trial_data);

          display_element.innerHTML = "";
          nonEmptyWords = [];
          currentAudio.pause();

          // next trial
          this.jsPsych.finishTrial(trial_data);
        }
      });

      var startTime = performance.now();

    } // end trial constructor
  } // SurveyTextPlugin

  SurveyTextPlugin.info = info;
  return SurveyTextPlugin;

})(jsPsychModule);
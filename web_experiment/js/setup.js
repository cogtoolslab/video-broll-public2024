const iterationName = 'pilot_5'

function sendData(data) {
  console.log('sending data');
  jsPsych.turk.submitToTurk({
    'score': 0 //this is a dummy placeholder
  });
}

// define trial object with boilerplate using global variables from above
// note that we make constructTrialParams later on...
function Trial() {
  this.dbname = 'video-broll';
  this.colname = 'video-broll';
  this.iterationName = iterationName;
};

/////////////////////////////////////
function setupGame() {
  socket.on('onConnected', function(d) {

    // begin jsPsych
    jsPsych = initJsPsych({
      show_progress_bar: true
    });

    /////////////////////////////////////
    // SET EXPERIMENT PARAMS
    // grab stims for mongoDB
    var meta = d.meta;
    var gameid = d.gameid;
    console.log('meta', meta);

    // get PROLIFIC participantID
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var prolificID = urlParams.get('PROLIFIC_PID') // ID unique to the participant
    var studyID = urlParams.get('STUDY_ID') // ID unique to the study
    var sessionID = urlParams.get('SESSION_ID') // ID unique to the particular submission
    var sonaID = jsPsych.data.getURLVariable('survey_code')
    console.log(sonaID, 'sona')

    // these are flags to control which trial types are included in the experiment
    const fullScreen = false;
    const includeIntro = true;
    const includeQuiz = true;
    const includePractice = true;
    const includeExitSurvey = true;
    const includeGoodbye = true;

    // which recruitment platform are we running our study on?
    const sona = false;
    if (sona) {
      var recruitmentPlatform = 'sona'
    } else {
      var recruitmentPlatform = 'prolific'
    };

    /////////////////////////////////////
    // function to save data locally and send data to server
    var main_on_finish = function(data) {
      socket.emit('currentData', data);
      console.log('emitting data');
    }

    // add additional boilerplate info
    var additionalInfo = {
      // add prolific info
      prolificID: prolificID,
      studyID: studyID,
      sessionID: sessionID,
      // add usual info
      gameID: gameid,
      recruitmentPlatform: recruitmentPlatform,
      // db stuff
      dbname: 'video-broll',
      colname: 'video-broll',
      iterationName: iterationName,
      // on_finish: main_on_finish
    }

    // count all stimuli trials
    var numTrials = meta[0].length;
    
    /////////////////////////////////////
    // SET INDIVIDUAL PLUGIN PARAMS
    let constructTrialParams = function(trial) {
      let trialParams;
        trialParams = {
          type: jsPsychSurveyTextHighlight,
          trialType: 'test',
          title: trial.title,
          goal: trial.goal,
          video_transcript: trial.transcript,
          instructions: "<p><u>Instructions</u>: \
          <b>Highlight 15 to 20 words you want to bring to life as pictures to help \
          make an " +  '<span id="goal">' + trial.goal + '</span>' + " video!</b></p> \
          <p>Click each red microphone to listen to an audio recording of each paragraph. \
          <i>Please listen to <u>all</u> the paragraphs recordings before highlighting words.</i> \
          When you done highlighting words, click 'Submit' to send your full highlighted transcript to a video editor.</p>",
      }
      return trialParams
    }; // close socket.on

    // shuffle trials within batches
    meta_shuff = _.shuffle(meta[0])

    // add plugin params and assemble all trial objects
    var trials_0 = _.map(meta_shuff.slice(0, 4), function(trial, i) {
      return _.extend({}, trial, additionalInfo, {
        trialNum: i,
        numTrials: numTrials,
      }, constructTrialParams(trial))
    });

    var trials_1 = _.map(meta_shuff.slice(4, 8), function(trial, i) {
      return _.extend({}, trial, additionalInfo, {
        trialNum: i + 4,
        numTrials: numTrials,
      }, constructTrialParams(trial))
    });


    var trials_2 = _.map(meta_shuff.slice(8, 13), function(trial, i) {
      return _.extend({}, trial, additionalInfo, {
        trialNum: i + 8,
        numTrials: numTrials,
      }, constructTrialParams(trial))
    });

    var practice = {
      type: jsPsychSurveyTextHighlight,
      trialType: 'practice',
      title: "What is a sunflower?",
      video_transcript: ["A sunflower is a vibrant and charming plant that brightens up gardens with its sunny disposition. \
      Standing tall on a sturdy stem, the sunflower's golden-yellow petals form a beautiful, \
      circular crown around a dark, disk-shaped center. This central part is filled with small, \
      edible seeds that are not only a treat for birds but also a popular snack for humans.",
        "What makes the sunflower even more fascinating is its unique behavior called heliotropism. \
        Throughout the day, the sunflower turns its face towards the sun, following its path across the sky. \
        This remarkable trait allows the sunflower to soak up as much sunlight as possible, \
        contributing to its robust growth and joyful appearance. \
        It's like the sunflower is constantly reaching out for the warmth and light, \
        just like a friend who brightens up your day with a warm smile.", 
        "Easy to cultivate, sunflowers are a popular choice for gardeners of all skill levels. \
        Their large, cheerful blooms bring a touch of summer to any outdoor space, \
        creating a delightful atmosphere. Whether you're enjoying their beauty in a garden or \
        using them to add a splash of color to your living space, sunflowers are a symbol of \
        positivity and radiance, making them a beloved part of nature's tapestry."],
      instructions: "<p>Your turn to try! Below is an example transcript for a video about sunflowers.</p> \
      <p><b>(1) Click each red microphone to hear an audio recording of the corresponding paragraph. Please listen to all the paragraphs first. <br> \
      (2) Use your cursor to select the words that \
      you would want to bring to life as pictures accompanying the final video.<br> \
      (3) Click the 'Highlight' button to add a yellow highlight.</b></p>\
      <p>Remember that each yellow highlighted text segment corresponds to a different individual picture. \
      Unfortunately, this highlighter tool does not accomodate photo montages. \
      For example, imagine you saw the phrase <new_text>'sunflowers, birds, and humans'</new_text> and \
      wanted 3 separate pictures of each word. \
      Do not highlight all the words together like this <new_text>'<yellow>sunflowers, birds, and humans</yellow>'</new_text>. \
      Instead, you need to highlight them separately like this <new_text>'<yellow>sunflowers</yellow>, <yellow>birds</yellow>, and <yellow>humans</yellow>'</new_text>. </p>\
      <p><b>Lastly, you must highlight 15 to 20 words in each transcript.</b></p> \
      <p>When you are done highlighting your words, click the 'Submit' button to send your highlighted transcript to a video editor. \
      A video editor would have access to your entire transcript, so you do not need to highlight extra words to provide additional context.</p>",
      gameID: gameid,
      dbname: 'video-broll',
      colname: 'video-broll',
      iterationName: iterationName,
      recruitmentPlatform: recruitmentPlatform,
      eventType: 'practice',
      goal: 'practice',
      object: 'sunflower',
      trialNum: 'practice',
      numTrials: 'practice',
      survey: 'not_survey'
    }

    // BROWSER CHECK
    var browsercheck = {
      type: jsPsychBrowserCheck,
      minimum_width: 1000,
      minimum_height: 650,
      inclusion_function: (data) => {
        return data.mobile === false
        // data.browser == 'chrome' &&
      },
      exclusion_message: (data) => {
        if (data.mobile) {
          return '<p>You must use a desktop or laptop computer to participate in this experiment.</p>';
        } else { //size violation
          return '<p>You have indicated that you cannot increase the size of your browser window.</p> \
          <p> If you <i>can</i> maximize your window, please do so now, and press the REFRESH button.</p> \
          <p>Otherwise, you can close this tab.</p>';
        }
      },
      data: {
        block: "browser_check"
      },
    };

    // add instruction pages
    let consentHTML = {
      'str1': '<div style = "text-align: left; width:800px; line-height:1.2"> \
      <p> Hello! In this study, you will read text about various topics (e.g., about animals, food, cities, and fashion) and asked to make judgments about them.</p> \
      <p style="text-align:left"> We expect an average study session to last 1 hour, including the time \
      it takes to read these instructions. For your participation in this study, \
      you will receive 1 SONA credit.</p><i> \
      <p style="text-align:left"> Note: <b>Please turn up your volume on your computer for this study.</b> \
      This study does not support mobile devices. \
      We also recommend using Chrome. We have not tested \
      this experiment in other browsers.</p></i></div>',
      'str2': '<div style = "text-align: left; width:800px; line-height:1.2"> \
      <u><p id="legal">Consenting to Participate</p></u> \
      <p id="legal" style="text-align:left"> \
      By completing this session, you are participating in a study being \
      performed by cognitive scientists at UC San Diego. If you have questions about this \
      research, please contact the <b>Cognitive Tools Lab</b> at <b> \
      <a href="mailto://cogtoolslab.requester@gmail.com">cogtoolslab.requester@gmail.com</a></b>. \
      You must be at least 18 years old to participate. There are neither specific benefits \
      nor anticipated risks associated with participation in this study. \
      Your participation in this research is voluntary. You may decline to answer any \
      or all of the following questions. You may decline further participation, \
      at any time, without adverse consequences. Your anonymity is assured; the researchers \
      who have requested your participation will not reveal any personal information about you.</p> \
      </div>'
    };

    let instructionsHTML = {
      'str1':'<div style = "text-align: left; width:800px; line-height:1.2"> \
      <p>Video content creators, like on YouTube, TikTok, Instagram, and even in academic video lectures, \
      often make videos of themselves talking to the camera. As they are speaking, they might display various \
      pictures to help illustrate what they are talking about to viewers watching their videos.</p> \
      <p>Here is an example video (left side) and the transcript of \
      what the speaker is saying (right side). Please watch the below video: </p> \
      <p><video class="example_transcript" controls> <source src="stim/example_broll.mp4" type="video/mp4"></p> \
      </div>',
      'str2':'<div style = "text-align: left; width:800px; line-height:1.2"> \
      <p>In that example video, the speaker chose to include pictures of whales, ears, and echolation to illustrate what they were saying: </p>\
      <img class="whales" src="stim/whale_examples.png"> \
      <p>In this study, <b>your task is to help us figure out what kind of pictures would be best to include in videos of different topics.</b> \
      Throughout this task, you will read various transcripts \
      and help us identify which words would be best to turn into pictures to accompany the final version of the video.</p>',
      'str2_continued':'<div style = "text-align: left; width:800px; font-size:20px; line-height:1.2"> \
      <p>Below is the transcript of the previous whale video. \
      Imagine you had only received this transcript and \
      were helping a video editor create the final video version that included illustrative pictures. \
      Highlighted in yellow are the words that you might want to bring to life as pictures:</p> \
      <img class="whales_transcript" src="stim/whale_transcript.png">',
      // 'str2_continued_2':'<div style = "text-align: left; width:800px; font-size:20px; line-height:1.2"> \
      // <p>Pictures like these might be generated by a human artist, found by searching on google images, or created using generative AI. \
      // Here is an example of text selected from transcripts that are converted into pictures using AI. \
      // Please watch the video below: </p> \
      // <p><video class="example_transcript" controls> <source src="stim/groll_broll_small.mp4" type="video/mp4"></p> \
      // <p>In this study, you will not be working with any AI to make pictures. <b>Your task will be to only help us select the text segments.</b> \
      // Before we are able to fully automate text-to-image AI, \
      // our first goal is to figure out which portions of text would be best to convert into pictures.</p> \
      // <p>As you select text segments, it is important for you to think about how that text might be converted into pictures. \
      // For example: \
      // <ul>\
      // <li>How might a human artist more easily convert certain text (e.g., a paragraph, sentence, or word) into a picture?</li> \
      // <li>What text segments might you use to google search for pictures?</li> \
      // <li>How might you expect AI to convert a text segment into a picture?</li>\
      // </ul>\
      // </p>\
      // <p>This study is <b>not</b> about identifying which text segements could generally use a picture to accompany it, \
      // but about which specific text segments would be best to <i>convert</i> into pictures to make a good final video. \
      // <b>Remember to think about what pictures would be best for viewers watching the final version of the videos you are helping to make!</b></p>\
      // </div>',
      'str2_continued_2':'<div style = "text-align: left; width:800px; font-size:20px; line-height:1.2"> \
      <p>After reviewing your full highlighted transcript, a video editor could then take those highlighted text segments \
      and turn them into pictures that would accompany the final video version. \
      <b>Here the 3 highlighted segments of text correspond to 3 different individual pictures.</b></p>\
      <p>A video editor might look for the relevant pictures on Google Images, Stock photos, or make the pictures themselves.</p> \
      <img class="whales_transcript_2" src="stim/whale_transcript2.png">',
      'str2_continued_3':'<div style = "text-align: left; width:800px; font-size:20px; line-height:1.2"> \
      <br><br><p>Note: <b>These yellow highlights <i>do not</i> correspond to the amount of time that a picture may be shown on screen.</b> \
      In other words, longer yellow highlights <i>do not</i> mean that a picture is shown for a longer amount of time.</p> \
      <p>Your task is only to help us identify which text segments would be \
      best as pictures. Imagine that you are helping to make pictures to add \
      to an image bank. A video editor could then choose from this image bank to edit in pictures for the final video version. </p> \
      <img class="whales_transcript_2" src="stim/whale_transcript2.png">',
      'str3':'<div style = "text-align: left; width:800px; font-size:20px; line-height:1.2"> \
      <p>Great job! Lastly, it is important to keep in mind that people make videos with different kinds of goals:</p> \
      <div id="goals_container"><img class="goals" src="stim/video_goals.png"></div> \
      <p>Some video content creators may make videos with the goal of making them as <b>ENTERTAINING</b> as possible. \
      These people may prioritize their viewers "liking" their video, "commenting" on their video, and subscribing to their channel.</p> \
      <p>Other video content creators may make videos with the goal of making them as <b>INFORMATIVE</b> as possible. \
      These people may prioritize their viewers remembering the content of their video, \
      whether they may need that information for a school test or general life knowledge</p> \
      <p><b>In this study, you will be given one of these goals to keep in mind.</b> \
      Depending on your specific goal, you should highlight words \
      that would be best as pictures to help the final edited video be as entertaining or informative as possible for viewers.</p> \
      </div>',
      // <ul>\
      // <li>You may highlight any length of text (words, phrase, sentences, paragraphs). \
      // Each highlight corresponds to what should be converted into a picture (e.g., 5 highlights corresponds to 5 pictures).\
      // However, the length of the highlight does <i>not</i> correspond to the duration of time that the picture would be displayed in the video. \
      // Instead, imagine that you are helping to generate a gallery of pictures that will eventually be added into the final version of the video.</li><br>\
      // <li>If a paragraph of text does need any pictures to be included, you may skip making any highlights by clicking "Next Paragraph". \
      // However, you must make at least one highlight per transcript.</li><br>\
      // <li>Please try your best to be as intentional as you can in this task! \
      // Think about what viewers would think about the final videos that you are helping to make!</li>\
      // </ul>\
      'str4':'<div style = "text-align: left; width:800px; font-size:20px; line-height:1.2"> \
      <p>Click "Next" when you are ready to start the study!</p> \
      </div>',
      'str6':"<div style = 'text-align: left; width:800px; font-size:20px; line-height:1.2'> \
      <p>You've completed 4 of 12 transcripts!</p> \
      <p>Remember that some content creators may make videos with the goal of making them as <b>entertaining</b> as possible \
      so that viewers 'like', write comments, and subscribe to their channel.</p> \
      <p>Other content creators may make videos with the goal of making them as <b>informative</b> as possible \
      so that viewers can remember the content of their video, \
      whether they may need that information for a school test or general life knowledge.</p> \
      <p><b>Your goal is to help make  <span style='text-transform:uppercase; color: red;'><b>" + meta[0][0]['goal'] + "</b></span> videos. \
      Highlight the words that would be best for a video editor to turn into pictures, based on your goal.</b> </p> \
      <p>Click 'Next' when you are ready continue the task.</p> \
      </div>",
      'str7':"<div style = 'text-align: left; width:800px; font-size:20px; line-height:1.2'> \
      <p>You've completed 8 of 12 transcripts! \
      <p>Remember that some content creators may make videos with the goal of making them as <b>entertaining</b> as possible \
      so that viewers 'like', write comments, and subscribe to their channel.</p> \
      <p>Other content creators may make videos with the goal of making them as <b>informative</b> as possible \
      so taht viewers can remember the content of their video, \
      whether they may need that information for a school test or general life knowledge.</p> \
      <p><b>Your goal is to help make  <span style='text-transform:uppercase; color: red;'><b>" + meta[0][0]['goal'] + "</b></span> videos. \
      Highlight the words that would be best for a video editor to turn into pictures, based on your goal.</b> </p> \
      <p>Click 'Next' when you are ready continue the task.</p> \
      </div>",
    }

    let fullscreentrial = {
      type: jsPsychFullscreen,
      fullscreen_mode: true
    }
  
    let intro0 = {
      type: jsPsychInstructions,
      pages: [
        consentHTML.str1,
        consentHTML.str2,
        instructionsHTML.str1,
        instructionsHTML.str2,
        instructionsHTML.str2_continued,
        instructionsHTML.str2_continued_2,
        instructionsHTML.str2_continued_3,
      ],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: true,
      force_wait: 1500,   
    }

    let intro1 = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str3,
      ],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: true,
      force_wait: 1500,   
    }
  
    let pretest_message = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str4,
      ],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: true
    }

    let break_message1 = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str6,
      ],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: true
    }

    let break_message2 = {
      type: jsPsychInstructions,
      pages: [
        instructionsHTML.str7,
      ],
      show_clickable_nav: true,
      allow_keys: false,
      allow_backward: true
    }

    let comprehensionSurvey = {
      type: jsPsychSurveyMultiChoice,
      preamble: "<strong>Quiz</strong>",
      questions: [{
        prompt: "Which words should you highlight?",
        name: 'goalOfTask',
        options: [
          "The first word of every pararaph of a transcript", 
          "Words from only the first paragraph of a transcript", 
          "Words that would be best to turn into pictures depending on your goal"],
        required: true
      },
      {
        prompt: "When video content creators are trying to make <i>INFORMATIVE</i> videos, what might they be trying to help their viewers do?",
        name: 'goal_inform',
        options: [
          "Remember the content for school work or general life knowledge", 
          "Learn incorrect facts about the world", 
          "Stay awake for as long as possible in the middle of the night"],
        required: true
      },
      {
        prompt: "When video content creators are trying to make <i>ENTERTAINING</i> videos, what might they be trying to help their viewers do?",
        name: 'goal_entertain',
        options: [
          "Fall asleep", 
          "Be bored and not finish watching the video", 
          "Like their video and subscribe to their channel"],
        required: true
      },
      {
        prompt: "When you make one highlight, that highlight means that you want:",
        name: 'pic_time',
        options: [
          "One picture of those highlighted words",
          "One photo montage sequence of those highlighted words",
          "One picture that is shown on screen in the final video for as long as the highlight is"],
        required: true,
      },
      {
        prompt: "If you were to highlight 5 portions of text within a transcript, \
        how many pictures does that correspond to?",
        name: 'numPics',
        options: [
          "3", 
          "5",
          "7", 
          "11"],
        required: true,
      },
      ]
    } // close comprehensionSurvey

    // Check whether comprehension check responses are correct
    var loopNode = {
      timeline: [comprehensionSurvey],
      loop_function: function(data) {
        resp = JSON.parse(data.values()[0]['responses']);
        // console.log('data.values',resp);
        if ((resp['goalOfTask'] == "Words that would be best to turn into pictures depending on your goal") &&
          (resp['goal_inform'] == "Remember the content for school work or general life knowledge") &&
          (resp['goal_entertain'] == "Like their video and subscribe to their channel") &&
          (resp['pic_time'] == "One picture of those highlighted words") &&
          (resp['numPics'] == "5")) {
          return false;
        } else {
          alert('Try again! One or more of your responses was incorrect.');
          return true;
        }
      }
    };
  
    ///////////////////////////////////
    // exit survey questions
    let surveyChoiceInfo = _.omit(_.extend({}, new Trial, additionalInfo));
    let exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
        type: jsPsychSurvey,
        pages: [
        [
          {
            type: 'drop-down',
            prompt: "What is your gender?",
            options: ["Male",
              "Female",
              "Other",
              "Do Not Wish To Say"],
            name: 'participant_sex',
            required: true,
          },
          {
            type: 'drop-down',
            prompt: "What is your ethnicity?",
            options: ["Black or African American",
              "American Indian or Alaska Native",
              "Asian",
              "Native Hawaiian or Other Pacific Islander",
              "White",
              "Hispanic or Latino",
              "Other/More than One Race/Do Not Wish To Say"],
            name: 'participant_ethnicity',
            required: true,
          },
          {
            type: 'text',
            prompt: "How old are you?",
            name: 'participant_age',
            textbox_columns: 5,
            required: true,
          },
          {
            type: 'text',
            prompt: "What year were you born?",
            name: 'participant_birthyear',
            textbox_columns: 5,
            required: true,
          }
        ],
        [
          {
            type: 'likert',
            prompt: 'When you try to form a mental picture, it is usually',
            likert_scale_min_label: 'no image',
            likert_scale_max_label: 'very clear',
            likert_scale_values: [
              { value: 1 },
              { value: 2 },
              { value: 3 },
              { value: 4 },
              { value: 5 },
              { value: 6 },
              { value: 7 }
            ],
            name: 'participant_subjectiveImagery',
            required: true,
          },
          {
            type: 'likert',
            prompt: 'How difficult did you find this study?',
            likert_scale_min_label: 'Very Easy',
            likert_scale_max_label: 'Very Hard',
            likert_scale_values: [
              { value: 1 },
              { value: 2 },
              { value: 3 },
              { value: 4 },
              { value: 5 }
            ],
            name: 'participant_difficulty',
            required: true,
          },
          {
            type: 'likert',
            prompt: 'Which of the following best describes the amount of effort you put into the task?',
            likert_scale_min_label: "I did not try at all",
            likert_scale_max_label: 'I did my very best',
            likert_scale_values: [
              { value: 0 },
              { value: 1 },
              { value: 2 },
              { value: 3 },
              { value: 4 },
              { value: 5 }
            ],
            name: 'participant_effort',
            required: true,
          }
        ]],
        title: 'Exit Survey',
        show_question_numbers: 'onPage'
      });

      var getip = function(){

        $.getJSON('https://ipinfo.io/json', function(d) {
          jsPsych.data.addProperties({ipInfo:JSON.stringify(d, null, 2) });
        })
      };

      let creatorInfo = _.omit(_.extend({}, new Trial, additionalInfo));
      let creator = _.extend({}, creatorInfo, {
        type: jsPsychSurvey,
        pages: [
        [
          {
            type: 'multi-choice',
            prompt: "Do you have experience making and uploading videos to a video \
            social media platform like YouTube, Instagram, TikTok, Vimeo, or related platforms?",
            options: ["Yes", "No"],
            name: 'participant_creator',
            required: true,
          },
          {
            type: 'text',
            prompt: "Please describe how you thought a video editor might take the words that you highlighted and turn them into pictures. \
            You do not need to write a long response, but please try to be as specific as you can in how you thought about things.",
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_text_to_image',
            required: true,
          },
          {
            type: 'text',
            prompt: "Please describe why you might have made highlights of different lengths. \
            For example, why might you have highlighted a phrase as opposed to a single word? \
            And how did you imagine a video editor turning a longer highlight, like a phrase, into a picture? \
            Please try to be as specific as you can.",
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_text_length',
            required: true,
          },
          {
            type: 'text',
            prompt: "Please describe how you thought your designated goal \
            (i.e., to help make informative or entertaining videos) changed how you highlighted words. \
            Please try to be as specific as you can.",
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_text_goal',
            required: true,
          },
          {
            type: 'text',
            prompt: "When you watch videos on e.g., Youtube, what do you think are the main differences between \
            videos that seem to be more informative vs. entertaining? \
            Please try to be as specific as you can.",
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_goal_difference',
            required: true,
          },
        ]],
        title: 'Exit Survey',
        show_question_numbers: 'onPage'
      });
      
      var fetchIp = {
        type: jsPsychCallFunction,
        func: getip,
        on_finish: main_on_finish
      }
      
      let isCreatorInfo = _.omit(_.extend({}, new Trial, additionalInfo));
      let isCreator = _.extend({}, isCreatorInfo, {
        type: jsPsychSurvey,
        pages: [
        [
          {
            type: 'drop-down',
            prompt: "How many years of experience do you have making videos?",
            options: ["None",
            "Less than 1 year",
            "1-2 years",
            "2-5 years", 
            "5-10 years",
            "10+ years"],
            name: 'participant_creatorYears',
            required: true,
          },
          {
            type: 'drop-down',
            prompt: "How many videos have you ever uploaded? \
            Please estimate to the best of your ability:",
            options: ["None",
            "1-5",
            "5-10",
            "10-20", 
            '20-50', 
            '50 or more',
            '100 or more', 
            '300 or more', 
            'More than 500'],
            name: 'participant_numVideos',
            required: true,
          },
          {
            type: 'drop-down',
            prompt: "In the past 3 months, how many videos have you uploaded? \
            Please estimate to the best of your ability:",
            options: ["None",
            "1-5",
            "5-10",
            "10 or more"],
            name: 'participant_3mon',
            required: true,
          },
          {
            type: 'multi-choice',
            prompt: "Which kind of video duration do you make most frequently?",
            options: ["Long form", 
            "Short form", 
            "Both long and short form equally", 
            "Neither"],
            name: 'participant_videoDur',
            required: true,
          }],
          [{
            type: 'multi-select',
            prompt: "What kind of videos do you have experience making?", 
            options: [
            "Interview videos", 
            "Live action videos (e.g., filming people that are not yourself, animals, or objects in the world)", 
            "Animation, typography, and/orS motion graphics videos", 
            "Talking head videos (e.g., filming yourself talking to the camera) ",
            "Screencast, photo montage, or slideshow videos (e.g., using voice over techniques while showing images or videos)",
            "Demo videos (e.g., teaching how to complete certain tasks or use products)",
            "None of the above"
          ],
            name: 'participant_videoType', 
            required: true,
          },
          {
            type: 'multi-choice',
            prompt: "Do your videos typically include you talking in your video or using voice over techniques?",
            options: ["Yes", 
            "Sometimes", 
            "Mostly no", 
            "Never"],
            name: 'participant_voice',
            required: true,
          },
          {
            type: 'multi-choice',
            prompt: "Do your videos typically include adding in b-roll during post-production editing? \
            This could include adding in images, text, animations, or movie clips after filming the main video.",
            options: ["Yes", 
            "Sometimes", 
            "Mostly no", 
            "Never"],
            name: 'participant_broll',
            required: true,
          },
          {
            type: 'multi-choice',
            prompt: "What most closely describes your experience with creating or editing videos?",
            options: ["I film videos and do little to no post-production editing myself", 
            "I film videos and do post-production editing myself ", 
            "I only do post-production editing of existing videos", 
            "I do not have experience filming or editing videos "],
            name: 'participant_editing',
            required: true,
          }],
          [{
            type: 'drop-down',
            prompt: "Which platform do you upload videos to most frequently?",
            options: ["Youtube",
            "Instagram",
            "TikTok",
            "Vimeo", 
            "Other"],
            name: 'participant_platform',
            required: true,
          }, 
          {
            type: 'text',
            prompt: "Of the platform that you use most frequently, how many subscribers or followers do you have?",
            textbox_columns: 5,
            name: 'participant_subscribers',
            required: true,
          },
          {
            type: 'text',
            prompt: "Of the platform that you use most frequently, what is/are the topic(s) that you specialize in posting about?",
            textbox_columns: 10,
            textbox_rows: 5,
            name: 'participant_topic',
            required: true,
          },
          {
            type: 'likert',
            prompt: 'Which goal do you think that you prioritize when making videos?',
            likert_scale_min_label: 'Being entertaining',
            likert_scale_max_label: 'Being informative',
            likert_scale_values: [
              {value: 0},
              {value: 1},
              {value: 2},
              {value: 3},
              {value: 4},
              {value: 5}, 
              {value: 6}, 
              {value: 7}
            ], 
            name: 'participant_goals', 
            required: true,
          }, 
        ]],
        title: 'Exit Survey',
        show_question_numbers: 'onPage'
      });
      
      
      var if_node = {
        timeline: [fetchIp, isCreator],
        conditional_function: function(){
            // get the data from the previous trial,
            // and check which key was pressed
            var data = jsPsych.data.get().last(1).values()[0].responses.participant_creator;
            console.log(data, 'data')
            if (data=='Yes'){
                return true;
            } else {
                return false;
            }
        }
      }

      let techInfo = _.omit(_.extend({}, new Trial, additionalInfo));
      let tech = _.extend({}, techInfo, {
        type: jsPsychSurvey,
        pages: [
          [
            {
              type: 'multi-choice',
              prompt: "Did you encounter any technical difficulties while completing \
                        this study? This could include: task interface was glitchy (e.g., videos or pictures did not load) \
                        or sections of the study did not load properly.",
              options: ["Yes", "No"],
              name: 'participant_technical',
              required: true,
            },
            {
              type: 'text',
              prompt: "If you encountered any technical difficulties, please briefly \
                        describe the issue.",
              textbox_columns: 10,
              textbox_rows: 5,
              name: 'participant_technical_freeresponse',
              required: false,
            },
            {
              type: 'text',
              prompt: "Thank you for participating in our study! Do you have any \
                        other comments or feedback \
                        to share with us about your experience?",
              textbox_columns: 10,
              textbox_rows: 5,
              name: 'participant_freeresponse',
              required: false,
            }
          ]],
        title: 'Exit Survey',
        show_question_numbers: 'onPage'
      });

      // define goodbye trial
      let goodbye = {
        type: jsPsychInstructions,
        pages: [
          'Congrats! You are all done. Thanks for participating in our study! \
          Click the button to submit this study. If you are not automatically \
          assigned credit after this, please wait a few days before reaching out to the researcher.'
        ],
        show_clickable_nav: true,
        allow_backward: false,
        button_label_next: 'Submit',
        on_finish: () => {
            window.onbeforeunload = null;

            // change URL to our study
            var completion_url = d.sonaURL + sonaID
            window.open(completion_url, "_self")
            // window.open("https://app.prolific.co/submissions/complete?cc=CC6PX69D", "_self");
        }
    };

    /////////////////////////////////////
    // add all experiment variables to trials array
    // initialize array
    var setup = [];

    // add instructions and consent
    if (fullScreen) setup.push(fullscreentrial);
    if (includeIntro) setup.push(intro0);
    if (includePractice) setup.push(practice);
    if (includeIntro) setup.push(intro1);
    if (includeQuiz) setup.push(loopNode);
    if (includeIntro) setup.push(pretest_message);
    // add test trials with breaks
    var experiment = setup.concat(trials_0, break_message1, trials_1, break_message2, trials_2);
    if (includeExitSurvey) experiment.push(exitSurveyChoice, creator, if_node, tech);
    if (includeGoodbye) experiment.push(goodbye);

    console.log('experiment', experiment);
    jsPsych.run(experiment);

  }); // close socket onConnected
} // close setupGame
# How do video content creation goals impact which concepts people prioritize for generating B-roll imagery?
#### Holly Huey, Mackenzie Leake, Deepali Aneja, Matthew Fisher, & Judith E. Fan

B-roll is vital when producing high-quality videos, but finding the right images can be difficult and time-consuming. Moreover, what B-roll is most effective can depend on a video content creator's intent---is the goal to entertain, to inform, or something else? While new text-to-image generation models provide promising avenues for streamlining B-roll production, it remains unclear how these tools can provide support for content creators with different goals. To close this gap, we aimed to understand how video content creator's goals guide which visual concepts they prioritize for B-roll generation. Here we introduce a benchmark containing judgments from >800 people as to which terms in $12$ video transcripts should be assigned highest priority for B-roll imagery accompaniment. We verified that participants reliably prioritized different visual concepts depending on whether their goal was help produce _informative_ or _entertaining_ videos. We next explored how well several algorithms, including heuristic approaches and large language models (LLMs), could predict systematic patterns in human judgments. We found that none of these methods fully captured human judgments in either goal condition, with state-of-the-art LLMs (i.e., GPT-4) even underperforming a baseline that sampled only nouns or nouns and adjectives. Overall, our work identifies opportunities for improvement in future algorithms that could lead to simpler and more streamlined video production workflows.

### Dataset

Effective video storytelling has a remarkable ability to captivate viewers. If you have ever felt moved by a documentary, social media clip, video lecture, or even advertisement, it is likely that you have been as equally influenced by the narrative of the main video (called _A-roll_) as its accompanying cutaway images and footage (called _B-roll_). A first step toward characterizing how video content creation goals impact B-roll preferences is to evaluate how creators prioritize different text content to generate accompanying B-roll. 

In our study, 12 transcripts spanning 4 popular video topics were generated by ChatGPT: _food_: Almas caviar, Murnong, Kopi Luwak coffee;  _fashion_: African kanzu, Indonesian kebaya, Mongolian deel; _city travel_: Vilnius, Lichinga, Cuenca; _animals_: vaquita, saola, dugong. For each transcript, ChatGPT generated a description spanning 5 topically focused paragraphs, 3 sentences each. Transcripts were approximately matched in word count (range = 276-310 words) and audio recorded (range = 1:54-2:08 minutes). 

We then designed a web-based experiment in which participants viewed the 12 video transcripts. Participants were told the transcripts would later be converted into talking head videos (i.e., in which a speaker talks directly to the camera), but were currently missing B-roll. During each trial, participants viewed one transcript and listened to its audio recording.  They were instructed to highlight segments of consecutive text with their cursor (e.g., ``long pointed horns'') that they believed would be best portrayed as B-roll. Participants were told a video editor would receive their highlighted transcripts and use their highlights to create B-roll for the final videos. Participants were instructed to highlight 15-20 words and told each highlighted text segment corresponded to one B-roll image.

Half of participants helped produce _informative_ videos intended to help viewers remember the transcript content for general life knowledge or school test. The other half of participants helped produce _entertaining_ videos intended to motivate viewers to ``like'', write comments, or subscribe to a video channel.

<p align="center" style="font-size: smaller">
  <img width="50%" src="results/plots/highlighting_methods_reduced.pdf"></img>
</p>

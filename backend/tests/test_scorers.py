import unittest

from app.common.scorer import (BERTScorer, BLEUScorer, CIDErScorer,
                               GreedyMatchingScorer, METEORScorer,
                               MoverScoreScorer, RougeScorer)

hyp_ref1 = [
    [
        "The issue isn’t about skin color, it’s about culture. Because light-skinned people have historically pushed dark-skinned people down not just in the US, or even just in European-descended cultures, look at India’s Caste system, being proud of being light skinned, especially of being a white person, includes an implication that you’re either proud of unaware of how your people have behaved throughout history. With darker-skinned people, it’s reclamation of power over themselves that they never had, but with light-skinned people the implication is that pride over your race harks back to a day when that meant you were better",
        "it’s because of the history of oppression between the two groups.",
    ],
    [
        "The meme is just a way for people to disregard an inconvenient truth or opinion they may not want to give credence. If one devalues the phrase we live in a society, it's taking away a powerful thought provoking phrase that forces people to look at an issue from a distance or question common behaviors or thinking.  Obviously there are going to be arguments where this phrase is exploited to manipulate people with gibberish, but it's also used constructively. Devalue the phrase itself and it only does harm to civil discourse. Also, what replaces it that is nearly as convenient when criticizing the societies we live in",
        "It's just trolls being intellectual trying to shut down conversations to win, because that's the point nowadays.",
    ],
    [
        "This will probably get lost in the thread, but I was in another state. I F met a guy on Xbox Live playing Halo 3. We connected on MySpace and Skype at the time. We didn't reconnect until five years later when he asked me to play Halo 4. After playing almost every day for eight months, we made plans for me to flight out to his house. I basically flew from Washington to California to lose my virginity. Although it turned into a long term relationship. We broke up a few years later. He didn't put in the effort to live together, I went back to college to get my bachelors, and distance got in the way. We broke up a few years. I still miss him",
        "Flew two states away to lose my virginity.",
    ],
]

hyp_ref2 = [
    [
        "  \n I installed Linux on a desktop that a family member uses almost exclusively for light browsing and email.  It's similar enough to Windows that they really didn't have any hurdles making the switch for this limited use case. It's been more reliable esp on this ultra small dell with only 32gb of drive space, which windows 10 destroyed lol, much faster, and generally a better experience overall, except for wireless being slightly flaky it occasionally drops and doesn't like to auto-reconnect even though it is set to do so, but they know how to restartreconnect it so it's not a big deal. If it becomes too much of an issue I'll use an extender wethernet or something similar !\"§$%&/(')=???",
        ' !!! !"§$% &/()= The only way I got my family to use Linux is to set it up for them myself, but generally no complaints from them about it- and actually some compliments mostly regarding the speed  \r\n   \t',
    ],
    [
        "  \n\n \n A while ago my best friend told me she wanted to die because her and the SO26M got into an argument that basically forced her into an ultimatum along these words of “If you don’t get your act together, we will break up”. Note They go through break up make ups a lot but her suicidal thoughts are recent.  Now, imo I think he had every right to put a conclusion on their relationship in such a way. I say that because she literally scrutinizes his EVERY move whether on social media, talking to his friends, or just walking to the deli forcing him to feel very smothered and choked up. She is INSANELY insecure. Although that’s probably not the problem he has w her, it’s more so she doesn’t have ambition for her future at all AND too depressed to work on herself to become the best version of herself. That is the root of my vent, her having no ambition but to only become a human leech adhered to him for the rest of her days. I care about her a lot and I’m always there to listen to her every word but I am becoming more and more disgusted with her limited outlook on life. I mean . no one is born to please someone else. Your parents brought you into the world so that you can take it by the storm, learn about your surroundings, and develop your own person.  If you have nothing of your own to live on to talk about and your only thoughts and actions are geared towards the man you’ve been with for 8 years . what does life mean for them? I really want to know. Thankfully, she never went through w it and they're back together but what can I do to be a better friend and push her to FIND HERSELF? Or is it not my position to do so? Someone please offer me rationale about her non-existent relationship w herself because I’ve never been madly in love w someone to that point so I really need perspective anecdotes",
        "  \r\n   \t My best friend has no   \r\n   \t ambition for herself and lives to please her boyfriend, what can I do to help her appreciate life and those around her not the bf?",
    ],
    [
        "I grew up working with my dad doing construction. If you sat on a bucket. BAM whatever was \r\n   \t in his hands hit you in the fucking face. I say this and it’s probably because he broke me at a young age but I appreciate what he did when I was a kid. I knew how to shake adults hands and look them square in the eye as a kid and I know multiple trades. I haven’t talked to My dad in years but he made me into a great man. In retrospect I appreciate him teaching me humility and respect",
        "TEACH YOUR KIDS HOW TO SHAKE A MANS \n HAND AND LOOK SOMEONE IN THE EYE.",
    ],
]

hyp_ref3 = [
    [
        "Hi there! I'm hoping to a bit of advice, I searched the subreddit already and didn't see a specific answer for this I'm 25, ADHD severe, mixed type, medicated and taking summer classes for the first time starting in May. The problem is I can't figure out what is an appropriate course load. The sessions are 5 and 6 weeks long, and I like many of you, I'm sure am a sprinter, not an endurance type of student, so I think the short intense bursts might work for me. In a perfect world I'd power through 5 courses each session, but apparently thats insane. Can I do 3 at least? I'm smart, but I'm scattered and my performance in classes is usually wildly up and down throughout the semester usually ending with a B because I miss at least one bigger assignment as time goes on. I was hoping to lean into student support services and try to find an ADHD coach I just found out those exist to avoid that and get. shit. sorted. All the details around school have been knocking me down for too long, I'm tired of it. I pick myself back up and try again every time, but enough is enough. If I get it all done like I want, this will be my last year of my undergrad, and I want that more than I can possibly explain. I have goals that require graduate school, because I'm a glutton for punishment I guess",
        "How many classes would you suggest for a motivated, medicated student in a 5-6 week summer session?",
    ],
    [
        "I realized that I was completely content and in love with the family I have. There was nothing more that I was missing. I took the perspective that another child would be a threat to that state of my life. If I had another child, I would absolutely love it with all of my heart. But, the reality is, I have limited resources. There's only so much to go around. Anything I spent on a future-child is something I am not spending on my actual children",
        "A couple years ago i had a vasectomy. I got home from the procedure and explained to my kids what happened.  One of them asked, Why would you do that? May answer was, essentially, I'm happy with the family I have.",
    ],
    [
        "though i agree that there should be more casual ways to enjoy league, the points you raised as being the shortcomings of league,are on the flip side, the things that makes league unique. also, and i dont think that you mentioned this,but battle royals offer a completely different experience compared with league,esp regarding grinding.in a battle royal you are only expected to win 1percent of the time. that is a much lower pressure than in league where you want to win 50 of games",
        "league should have more casual gamemodes but, grinding is completely different in league compared to fortnite.",
    ],
]


class TestScorer(unittest.TestCase):
    def setUp(self):
        self.hyp1, self.ref1 = zip(*hyp_ref1)
        self.hyp2, self.ref2 = zip(*hyp_ref2)
        self.hyp3, self.ref3 = zip(*hyp_ref3)

    def test_bert(self):
        bert = BERTScorer()
        self.assertAlmostEqual(
            bert.score(self.hyp1, self.ref1)["BERT"], 0.6282894611358643, places=4
        )
        self.assertAlmostEqual(
            bert.score(self.hyp2, self.ref2)["BERT"], 0.6359902620315552, places=4
        )
        self.assertAlmostEqual(
            bert.score(self.hyp3, self.ref3)["BERT"], 0.6989876627922058, places=4
        )

    def test_bleu(self):
        bleu = BLEUScorer()
        scores = bleu.score(self.hyp1, self.ref1)
        self.assertAlmostEqual(scores["BLEU 1"], 0.038922155688506224)
        self.assertAlmostEqual(scores["BLEU 2"], 0.018782139991870398)
        self.assertAlmostEqual(scores["BLEU 3"], 0.012908687861207616)
        self.assertAlmostEqual(scores["BLEU 4"], 0.009019671784498333)
        scores = bleu.score(self.hyp2, self.ref2)
        self.assertAlmostEqual(scores["BLEU 1"], 0.06491228070164051)
        self.assertAlmostEqual(scores["BLEU 2"], 0.03209912244795774)
        self.assertAlmostEqual(scores["BLEU 3"], 0.017630967974136835)
        self.assertAlmostEqual(scores["BLEU 4"], 0.011822896862594976)
        scores = bleu.score(self.hyp3, self.ref3)
        self.assertAlmostEqual(scores["BLEU 1"], 0.08114558472534333)
        self.assertAlmostEqual(scores["BLEU 2"], 0.03695173219487842)
        self.assertAlmostEqual(scores["BLEU 3"], 0.021485572758011943)
        self.assertAlmostEqual(scores["BLEU 4"], 0.014831044444629805)

    def test_cider(self):
        cider = CIDErScorer()
        self.assertAlmostEqual(
            cider.score(self.hyp1, self.ref1)["CIDEr"], 2.2141462556094686e-48
        )
        self.assertAlmostEqual(
            cider.score(self.hyp2, self.ref2)["CIDEr"], 3.2303633436054094e-42
        )
        self.assertAlmostEqual(
            cider.score(self.hyp3, self.ref3)["CIDEr"], 1.6226327093082516e-13
        )

    def test_greedy_matching(self):
        greedy = GreedyMatchingScorer()
        self.assertAlmostEqual(
            greedy.score(self.hyp1, self.ref1)["greedy matching"], 0.731808, places=5
        )
        self.assertAlmostEqual(
            greedy.score(self.hyp2, self.ref2)["greedy matching"], 0.792653, places=5
        )
        self.assertAlmostEqual(
            greedy.score(self.hyp3, self.ref3)["greedy matching"], 0.813903, places=5
        )

    def test_meteor(self):
        meteor = METEORScorer()
        self.assertAlmostEqual(
            meteor.score(self.hyp1, self.ref1)["METEOR"], 0.09364789478497404
        )
        self.assertAlmostEqual(
            meteor.score(self.hyp2, self.ref2)["METEOR"], 0.1431809601337241
        )
        self.assertAlmostEqual(
            meteor.score(self.hyp3, self.ref3)["METEOR"], 0.15321183413744194
        )

    def test_mover_score(self):
        moverscore = MoverScoreScorer()
        self.assertAlmostEqual(
            moverscore.score(self.hyp1, self.ref1)["MoverScore"], 0.0752235538592229
        )
        self.assertAlmostEqual(
            moverscore.score(self.hyp2, self.ref2)["MoverScore"], 0.4053295659617621
        )
        self.assertAlmostEqual(
            moverscore.score(self.hyp3, self.ref3)["MoverScore"], 0.1173134099047809
        )

    def test_rouge(self):
        rouge = RougeScorer()
        score = rouge.score(self.hyp1, self.ref1)
        self.assertAlmostEqual(score["rouge 1"], 0.07747685408721354)
        self.assertAlmostEqual(score["rouge 2"], 0.01492537280426228)
        self.assertAlmostEqual(score["rouge l"], 0.07163896280847971)
        score = rouge.score(self.hyp2, self.ref2)
        self.assertAlmostEqual(score["rouge 1"], 0.1028008913462572)
        self.assertAlmostEqual(score["rouge 2"], 0.01591511889002246)
        self.assertAlmostEqual(score["rouge l"], 0.10136971272662082)
        score = rouge.score(self.hyp3, self.ref3)
        self.assertAlmostEqual(score["rouge 1"], 0.1752551226727634)
        self.assertAlmostEqual(score["rouge 2"], 0.0415353512276316)
        self.assertAlmostEqual(score["rouge l"], 0.18107603796942154)


if __name__ == "__main__":
    unittest.main()

from summarizers import TextRank
import glob
from preprocessing import PreProcessor
from scoring import Scorer
import json


def run():
    document = ''' Stoicism was one of the new philosophical movements of the Hellenistic period. The name derives from the porch (stoa poikilê) in the Agora at Athens decorated with mural paintings, where the members of the school congregated, and their lectures were held. Unlike ‘epicurean,’ the sense of the English adjective ‘stoical’ is not utterly misleading with regard to its philosophical origins. The Stoics did, in fact, hold that emotions like fear or envy (or impassioned sexual attachments, or passionate love of anything whatsoever) either were, or arose from, false judgements and that the sage – a person who had attained moral and intellectual perfection – would not undergo them. The later Stoics of Roman Imperial times, Seneca and Epictetus, emphasise the doctrines (already central to the early Stoics’ teachings) that the sage is utterly immune to misfortune and that virtue is sufficient for happiness. Our phrase ‘stoic calm’ perhaps encapsulates the general drift of these claims. It does not, however, hint at the even more radical ethical views which the Stoics defended, e.g. that only the sage is free while all others are slaves, or that all those who are morally vicious are equally so. (For other examples, see Cicero’s brief essay ‘Paradoxa Stoicorum’.) Though it seems clear that some Stoics took a kind of perverse joy in advocating views which seem so at odds with common sense, they did not do so simply to shock. Stoic ethics achieves a certain plausibility within the context of their physical theory and psychology, and within the framework of Greek ethical theory as that was handed down to them from Plato and Aristotle. It seems that they were well aware of the mutually interdependent nature of their philosophical views, likening philosophy itself to a living animal in which logic is bones and sinews; ethics and physics, the flesh and the soul respectively (another version reverses this assignment, making ethics the soul). Their views in logic and physics are no less distinctive and interesting than those in ethics itself.  '''

    textrank = TextRank(weight_function='lexical_overlap')
    summary = textrank.summarize(text=document).strip()
    print(summary)

if __name__ == "__main__":
    run()
    

    
from random import sample
from masking_plugins.Mask_abstract import Mask_abstract
import sys
sys.path.insert(0, 'data/dictionaries')
from dictionaries.populate import last_names


class MaskLastNameRandomized(Mask_abstract):
    """This class replace the last name with randomized name from the dictionary"""
    def __init__(self):
        self.replacements = {}

    def mask(self, text_to_reduct) -> str:
        """ Replace the name with a random name from dictionary"""
        if text_to_reduct not in self.replacements.keys():
            replacement = sample(last_names(), 1)
            self.replacements[text_to_reduct]= replacement[0].title()
        return self.replacements[text_to_reduct]

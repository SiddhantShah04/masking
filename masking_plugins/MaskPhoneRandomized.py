from random import randrange
from masking_plugins.Mask_abstract import Mask_abstract


class MaskPhoneRandomized(Mask_abstract):
    """This class replace the last digits of a phone number with random number"""
    def __init__(self):
        self.replacements = {}

    def mask(self, text_to_reduct) -> str:
        """ change the last four characters of phone number"""
        if text_to_reduct not in self.replacements.keys():
            last_four_chars = str(randrange(100000, 999999, 1))

            self.replacements[text_to_reduct]= text_to_reduct[:-(len(text_to_reduct))] + last_four_chars
        return self.replacements[text_to_reduct]

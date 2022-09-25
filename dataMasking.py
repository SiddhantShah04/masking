from os import listdir, path, mkdir
from os.path import isfile, join
import xml.etree.ElementTree as ET
import importlib
from brat_parser import get_entities_relations_attributes_groups
import datetime

def get_data_sequences(file):
  ann_data = get_entities_relations_attributes_groups("data/ann/"+ file + ".ann")
  sequences = []
  for key,values in ann_data[0].items():
    data =(values.text,values.type, values.span[0][0],values.span[0][1])
    sequences.append(data)
  return sequences

class Configuration():
    def __init__(self, configuration="configuration.cnf"):
        """Init function that can take configuration file"""
        self.conf = configuration
        conf_doc = ET.parse(self.conf)
        root = conf_doc.getroot()
        self.entities_list = []
        for elem in root:
            if elem.tag == "project_name":
                self.project_name = elem.text
            if elem.tag == "algorithms":
                for entities in elem:
                    entity = {}
                    for ent in entities:
                        entity[ent.tag] = ent.text
                    self.entities_list.append(entity)
            if elem.tag == "dataset":
                for ent in elem:
                    if ent.tag == "dataset_location":
                        self.dataset_location = ent.text
                    if ent.tag == "data_output":
                        self.data_output = ent.text

def main():
    print("Welcome to NERM Group Masking")
    cf = Configuration()
    data = [f for f in listdir(cf.dataset_location) if isfile(join(cf.dataset_location, f))]
    algorithms = []
    for entity in cf.entities_list:
      masking_type = entity['masking_type']
      entity_name = entity['entity_name']
      if masking_type == "Redact":
          masking_class = ""
      else:
          masking_class = entity['masking_class']

      algorithms.append({"masking_type":masking_type, "entity_name":entity_name, "masking_class":masking_class})

    mask_running_log = open('log_mask_running.log','w',encoding='utf-8')
    mask_running_log.write("Project name: "+cf.project_name+"\n")
    mask_running_log.write("Time of run: " + str(datetime.datetime.now()) + "\n\n")
    mask_running_log.write("RUN LOG \n")
    elements = []
    for file in data:
        mask_running_log.write("Running stats for file: "+file+'\n')
        text = open(cf.dataset_location+"/"+file, 'r').read()
        new_text = text
        for alg in algorithms:
            result = get_data_sequences(file[:-4])
            if alg["masking_type"] == "Redact":
                for i in range(0, len(result)):
                    if result[i][1] == alg["entity_name"]:
                        print ("----------------------- " + result[i][1] + " ----------------")
                        old_token = result[i][0]
                        new_token = "XXX"
                        print (old_token+ " ---> " + new_token)
                        new_text = new_text.replace(old_token, new_token)
                        mask_running_log.write("REDACTED ENTITY: "+result[i][1]+" -- "+old_token+' ->'+new_token+'\n')

            elif alg["masking_type"] == "Mask":
                masking_class = alg['masking_class']
                plugin_module = importlib.import_module("masking_plugins." + masking_class)
                class_masking = getattr(plugin_module, masking_class)
                masking_instance = class_masking()
                for i in range(0, len(result)):
                    if result[i][1] == alg["entity_name"]:
                        old_token = result[i][0]
                        print ("----------------------- " + result[i][1] + " ----------------")
                        new_token = masking_instance.mask(result[i][0])
                        print (old_token+ " ---> " + new_token)
                        new_text = new_text.replace(old_token, new_token)
                        mask_running_log.write(
                            "MASKED ENTITY: " + result[i][1] + " -- " + old_token + ' ->' + new_token+'\n')
            # Create target Directory if don't exist
        if not path.exists(cf.data_output):
            mkdir(cf.data_output)
        # write into output files
        file_handler = open(cf.data_output + "/" + file, "w")
        file_handler.write(new_text)
        file_handler.close()
        for alg in algorithms:
            cnt = elements.count(alg['entity_name'])
            if alg["masking_type"] == "Mask":
                mask_running_log.write('Total masked for '+alg['entity_name']+": "+str(cnt)+'\n')
            if alg["masking_type"] == "Redact":
                mask_running_log.write('Total redacted for '+alg['entity_name']+": "+str(cnt)+'\n')
        mask_running_log.write('END for file:'+ file+'\n')
        mask_running_log.write('========================================================================')
    mask_running_log.close()


if __name__=="__main__":
    main()

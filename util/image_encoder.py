import base64

def encode_image(file):
    # Read the binary data from the InMemoryUploadedFile object
    image_data = file.read()
    # Encode the binary data using base64
    encoded_data = base64.b64encode(image_data).decode('utf-8')
    return encoded_data
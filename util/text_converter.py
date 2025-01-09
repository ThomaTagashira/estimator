from openai import OpenAI
# from langsmith import traceable
from rest_framework.response import Response
import logging
from rest_framework import status


logger = logging.getLogger(__name__)

# @traceable
def image_to_text(base64_photo):
    base64_image = f"data:image/jpeg;base64,{base64_photo}"
    client = OpenAI()
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Only return text, autocorrect any spelling errors or illegible text. Do not generate any other text"},
                    {
                        "type": "image_url",
                        "image_url": {"url": base64_image}
                    }
                ],
            }
        ],
        max_tokens=500,
    )

    text =  response.choices[0].message.content

    if text is None:
        logger.error("No text was extracted from the image.")
        return Response({'error': 'Failed to extract text from the image'}, status=status.HTTP_400_BAD_REQUEST)

    lines = text.split('\n')
    text_dict = {f"line_{i+1}": line for i, line in enumerate(lines)}
    print(text_dict)
    return text_dict
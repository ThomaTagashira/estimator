#cleanup_s3.sh

# Define variables
BUCKET_NAME="dis-be-da-estimator-test-bucket"
TEST_FILE="dis-be-da-test-file.txt"  # Specify the test file to delete, or use * to delete all files

# Delete the specific test file from the S3 bucket
echo "Deleting test file from S3 bucket..."
aws s3 rm s3://$BUCKET_NAME/$TEST_FILE

# Alternatively, delete all files in the bucket (use with caution)
# echo "Deleting all files from S3 bucket..."
# aws s3 rm s3://$BUCKET_NAME --recursive

echo "S3 cleanup completed."

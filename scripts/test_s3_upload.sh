# test_s3_upload.sh

# Define variables
TEST_BUCKET_NAME="dis-be-da-bucket-name"  # Replace with your actual test bucket name
PACKAGE_NAME="dis-be-da-test-deploy-package.zip"

# Create a deployment package
zip -r $PACKAGE_NAME . -x ".*" -x "*/.*"

# Upload the package to S3
echo "Uploading $PACKAGE_NAME to S3://$TEST_BUCKET_NAME..."
aws s3 cp $PACKAGE_NAME s3://$TEST_BUCKET_NAME/$PACKAGE_NAME

# Verify the upload
echo "Verifying upload of $PACKAGE_NAME..."
aws s3 ls s3://$TEST_BUCKET_NAME/$PACKAGE_NAME

# Check if the upload was successful
if aws s3 ls s3://$TEST_BUCKET_NAME/$PACKAGE_NAME; then
    echo "S3 upload test successful."
    exit 0
else
    echo "S3 upload test failed."
    exit 1
fi
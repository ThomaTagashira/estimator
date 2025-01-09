# test_s3_upload.sh

TEST_BUCKET_NAME="dis-be-da-bucket-name"  
PACKAGE_NAME="dis-be-da-test-deploy-package.zip"

zip -r $PACKAGE_NAME . -x ".*" -x "*/.*"

echo "Uploading $PACKAGE_NAME to S3://$TEST_BUCKET_NAME..."
aws s3 cp $PACKAGE_NAME s3://$TEST_BUCKET_NAME/$PACKAGE_NAME

echo "Verifying upload of $PACKAGE_NAME..."
aws s3 ls s3://$TEST_BUCKET_NAME/$PACKAGE_NAME

if aws s3 ls s3://$TEST_BUCKET_NAME/$PACKAGE_NAME; then
    echo "S3 upload test successful."
    exit 0
else
    echo "S3 upload test failed."
    exit 1
fi
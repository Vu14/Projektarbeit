# Projektarbeit

## Setup Instructions

1. **Clone the Repository**
   ```sh
   git clone https://github.com/Vu14/Projektarbeit.git
   cd Projektarbeit
   ```

2. **Install the Requirements**
   ```sh
   pip install -r requirements.txt
   ```

## Running the Project

1. **Start the Flask Application**
   ```sh
   flask run
   ```

2. **Access the Dashboard**
   Open your web browser and navigate to `http://127.0.0.1:5000`.

## Loading Example Data

1. **Prepare Your Data**
   Ensure your data is in a CSV format and follows the required schema.

2. **Load Data**
   Use the provided interface on the dashboard to upload your CSV file.

## Overview of Functions

### Data Visualization
- **Create Visualization:** Initializes a geographical visualization based on the provided data. This function is used to create maps that display data points based on geographic locations.
- **Update Visualization:** Updates the existing visualizations based on user selections or new data inputs. This function ensures that the visualizations reflect the most current data and user preferences.

### Data Management
- **Upload Datasets:** You can upload your datasets in CSV format through the dashboard interface. The system will validate the data and provide feedback if there are any issues.
- **View Data Entries:** The dashboard allows you to view the data entries in a tabular format. You can sort and filter the data to find specific entries.
- **Edit Data Entries:** If you need to make changes to your data, you can edit the entries directly within the dashboard. This feature ensures that your data is always up-to-date.

### User Interaction
- **Interactive Filters:** Apply filters to your data visualizations to focus on specific subsets of data. This helps in analyzing particular segments without distraction.
- **Customizable Views:** Adjust the settings of your visualizations to suit your preferences. You can change the chart types, colors, and other display options.
- **Tooltips and Annotations:** Hover over data points to see additional information. You can also add annotations to highlight important insights.

## Presentation Slides

- Ensure your presentation covers:
  - Introduction to the dashboard and its functions.
  - Explanation of chosen visualizations and interactions.
  - Each team member's contribution to the project.

- **Presentation Tips**
  - Keep it concise and within the time limit.
  - Engage with the audience and explain your thought process.
  - Use visuals and examples to illustrate your points.

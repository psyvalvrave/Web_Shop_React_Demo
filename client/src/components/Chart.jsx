import React, { useState, useEffect } from 'react';

function Chart({ commentCounts }) {
    const [chartHtml, setChartHtml] = useState('');

    useEffect(() => {
        if (commentCounts.length > 0) {
            const labels = commentCounts.map(d => d.productId);
            const values = commentCounts.map(d => d.count);
            fetch('https://24hourcharts.p.rapidapi.com/v1/charts/html', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-rapidapi-key': 'ec62eeff2fmshc64f406709c5eaap19f807jsn23bf4f2a981f',
                    'x-rapidapi-host': '24hourcharts.p.rapidapi.com',
                },
                body: JSON.stringify({
                    type: 'bar',
                    title: 'Comments per Product',
                    labels: labels,
                    datasets: [{ label: 'Comments', values: values }],
                })
            })
            .then(response => response.text())
            .then(html => setChartHtml(html))
            .catch(error => console.error('Error fetching chart data:', error));
        }
    }, [commentCounts]);

    return (
        <div>
            {chartHtml ? <div dangerouslySetInnerHTML={{ __html: chartHtml }} /> : <p>Chart loading...</p>}
        </div>
    );
}

export default Chart;

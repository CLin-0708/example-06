// app.js 第三步：Chart.js折线图与窗口自适应
const state = { data: null };

const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data/books.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.series.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：' + (data.source || '课程统一数据集'));
    $('#status').hide();
    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);
  } catch (error) {
    let msg = '加载失败：' + error.message;
    if (window.location.protocol === 'file:') {
      msg += '（提示：浏览器直接双击 file:// 打开会拦截 fetch，可访问 <a href="http://localhost:8080/example-06/index.html" class="alert-link">http://localhost:8080/example-06/index.html</a> 或 <a href="#" id="use-local-data" class="alert-link">点击此处使用内置数据快速演示</a>）';
    }
    $('#status').html(msg).show();
    $('#use-local-data').on('click', function(e) {
      e.preventDefault();
      $('#status').hide();
      state.data = localFallbackData;
      $('#sub-title').text(localFallbackData.title + ' · 数据来源：' + (localFallbackData.source || '课程统一数据集'));
      renderCards(localFallbackData);
      renderBarChart(localFallbackData);
      renderLineChart(localFallbackData);
    });
  }
};

const localFallbackData = {
  title: "图书馆借阅月报",
  source: "课程统一数据集（教学演示数据，非真实统计）",
  months: ["3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月"],
  series: [
    { category: "文学", counts: [352, 389, 401, 378, 296, 243, 398, 412, 437, 405, 361, 328] },
    { category: "科技", counts: [131, 142, 156, 149, 118, 96, 151, 163, 171, 158, 139, 124] },
    { category: "历史", counts: [92, 101, 110, 104, 83, 71, 105, 112, 118, 109, 97, 88] },
    { category: "经济", counts: [71, 78, 86, 82, 64, 52, 83, 89, 94, 87, 77, 69] },
    { category: "艺术", counts: [76, 84, 92, 88, 69, 58, 88, 95, 101, 93, 82, 74] },
    { category: "外语", counts: [98, 109, 118, 112, 88, 73, 112, 121, 128, 119, 105, 94] }
  ]
};

const renderCards = (data) => {
  const months = data.months;
  data.series.forEach(s => {
    const total = s.counts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${s.category}</h3>
            <p class="card-text fs-4">${total}</p>
            <p class="card-text small text-muted">共${months.length}个月累计借阅</p>
          </div>
        </div>
      </div>
    `);
  });
};

let barChart = null;
const renderBarChart = (data) => {
  if (barChart === null) {
    barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  barChart.setOption({
    title: { text: '各月各品类借阅量', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { data: data.months },
    yAxis: { name: '册' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  });
};

let lineChart = null;
const renderLineChart = (data) => {
  if (lineChart !== null) {
    lineChart.destroy(); // 防重复初始化
  }
  const ctx = document.querySelector('#line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.months,
      datasets: data.series.map(s => ({
        label: s.category,
        data: s.counts,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '借阅趋势（单位：册）' }
      }
    }
  });
};

// 窗口自适应
window.addEventListener('resize', () => {
  if (barChart) barChart.resize(); // Chart.js 响应式默认自动处理
});

// 第四步（选做进阶）：jQuery 改造交互，点击卡片切换高亮
$('#cards').on('click', '.card', function () {
  $(this).toggleClass('border-primary shadow');
});

loadData();
